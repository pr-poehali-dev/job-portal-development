"""API для управления вакансиями"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional

def get_db_connection():
    """Создание подключения к БД"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def get_user_from_session(session_token: Optional[str]) -> Optional[dict]:
    """Получение пользователя по токену сессии"""
    if not session_token:
        return None
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT u.id, u.email, u.full_name, u.user_type
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.session_token = %s AND s.expires_at > NOW()
            """, (session_token,))
            return cur.fetchone()
    finally:
        conn.close()

def handler(event: dict, context) -> dict:
    """API endpoint для работы с вакансиями"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    session_token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
    user = get_user_from_session(session_token)
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            if method == 'GET':
                params = event.get('queryStringParameters') or {}
                vacancy_id = params.get('id')
                employer_id = params.get('employer_id')
                status = params.get('status', 'active')
                
                if vacancy_id:
                    cur.execute("""
                        SELECT v.*, u.full_name as employer_name
                        FROM vacancies v
                        JOIN users u ON v.employer_id = u.id
                        WHERE v.id = %s
                    """, (vacancy_id,))
                    vacancy = cur.fetchone()
                    
                    if vacancy:
                        cur.execute("UPDATE vacancies SET views_count = views_count + 1 WHERE id = %s", (vacancy_id,))
                        conn.commit()
                        
                        return {
                            'statusCode': 200,
                            'headers': headers,
                            'body': json.dumps(dict(vacancy), ensure_ascii=False),
                            'isBase64Encoded': False
                        }
                    else:
                        return {
                            'statusCode': 404,
                            'headers': headers,
                            'body': json.dumps({'error': 'Вакансия не найдена'}, ensure_ascii=False),
                            'isBase64Encoded': False
                        }
                
                query = """
                    SELECT v.*, u.full_name as employer_name
                    FROM vacancies v
                    JOIN users u ON v.employer_id = u.id
                    WHERE v.status = %s
                """
                query_params = [status]
                
                if employer_id:
                    query += " AND v.employer_id = %s"
                    query_params.append(employer_id)
                
                query += " ORDER BY v.created_at DESC"
                
                cur.execute(query, query_params)
                vacancies = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(v) for v in vacancies], ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                if not user or user['user_type'] != 'employer':
                    return {
                        'statusCode': 403,
                        'headers': headers,
                        'body': json.dumps({'error': 'Доступ запрещен'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                data = json.loads(event.get('body', '{}'))
                
                cur.execute("""
                    INSERT INTO vacancies (
                        employer_id, title, company, location, salary_min, salary_max,
                        employment_type, experience, description, requirements, tags
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    user['id'],
                    data.get('title'),
                    data.get('company'),
                    data.get('location'),
                    data.get('salary_min'),
                    data.get('salary_max'),
                    data.get('employment_type'),
                    data.get('experience'),
                    data.get('description'),
                    data.get('requirements'),
                    data.get('tags', [])
                ))
                
                vacancy_id = cur.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'id': vacancy_id, 'message': 'Вакансия создана'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            elif method == 'PUT':
                if not user or user['user_type'] != 'employer':
                    return {
                        'statusCode': 403,
                        'headers': headers,
                        'body': json.dumps({'error': 'Доступ запрещен'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                data = json.loads(event.get('body', '{}'))
                vacancy_id = data.get('id')
                
                cur.execute("SELECT employer_id FROM vacancies WHERE id = %s", (vacancy_id,))
                vacancy = cur.fetchone()
                
                if not vacancy or vacancy['employer_id'] != user['id']:
                    return {
                        'statusCode': 403,
                        'headers': headers,
                        'body': json.dumps({'error': 'Доступ запрещен'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    UPDATE vacancies SET
                        title = %s, company = %s, location = %s, salary_min = %s, salary_max = %s,
                        employment_type = %s, experience = %s, description = %s, requirements = %s,
                        tags = %s, status = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (
                    data.get('title'),
                    data.get('company'),
                    data.get('location'),
                    data.get('salary_min'),
                    data.get('salary_max'),
                    data.get('employment_type'),
                    data.get('experience'),
                    data.get('description'),
                    data.get('requirements'),
                    data.get('tags', []),
                    data.get('status', 'active'),
                    vacancy_id
                ))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Вакансия обновлена'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            else:
                return {
                    'statusCode': 405,
                    'headers': headers,
                    'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    finally:
        conn.close()
