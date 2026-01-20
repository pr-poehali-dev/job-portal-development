"""API для управления откликами на вакансии"""
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
    """API endpoint для работы с откликами"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    
    if not user:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Требуется авторизация'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            if method == 'GET':
                params = event.get('queryStringParameters') or {}
                vacancy_id = params.get('vacancy_id')
                
                if user['user_type'] == 'applicant':
                    query = """
                        SELECT a.*, v.title, v.company, v.salary_min, v.salary_max
                        FROM applications a
                        JOIN vacancies v ON a.vacancy_id = v.id
                        WHERE a.applicant_id = %s
                        ORDER BY a.created_at DESC
                    """
                    cur.execute(query, (user['id'],))
                elif user['user_type'] == 'employer':
                    if vacancy_id:
                        query = """
                            SELECT a.*, u.full_name, u.email, r.position, r.phone
                            FROM applications a
                            JOIN users u ON a.applicant_id = u.id
                            LEFT JOIN resumes r ON a.resume_id = r.id
                            JOIN vacancies v ON a.vacancy_id = v.id
                            WHERE a.vacancy_id = %s AND v.employer_id = %s
                            ORDER BY a.created_at DESC
                        """
                        cur.execute(query, (vacancy_id, user['id']))
                    else:
                        query = """
                            SELECT a.*, u.full_name, u.email, v.title, v.company
                            FROM applications a
                            JOIN users u ON a.applicant_id = u.id
                            JOIN vacancies v ON a.vacancy_id = v.id
                            WHERE v.employer_id = %s
                            ORDER BY a.created_at DESC
                        """
                        cur.execute(query, (user['id'],))
                
                applications = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(a) for a in applications], ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                if user['user_type'] != 'applicant':
                    return {
                        'statusCode': 403,
                        'headers': headers,
                        'body': json.dumps({'error': 'Только соискатели могут откликаться'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                data = json.loads(event.get('body', '{}'))
                vacancy_id = data.get('vacancy_id')
                resume_id = data.get('resume_id')
                cover_letter = data.get('cover_letter', '')
                
                try:
                    cur.execute("""
                        INSERT INTO applications (vacancy_id, applicant_id, resume_id, cover_letter)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id
                    """, (vacancy_id, user['id'], resume_id, cover_letter))
                    
                    application_id = cur.fetchone()['id']
                    conn.commit()
                    
                    return {
                        'statusCode': 201,
                        'headers': headers,
                        'body': json.dumps({'id': application_id, 'message': 'Отклик отправлен'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                except psycopg2.IntegrityError:
                    conn.rollback()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Вы уже откликались на эту вакансию'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
            
            elif method == 'PUT':
                if user['user_type'] != 'employer':
                    return {
                        'statusCode': 403,
                        'headers': headers,
                        'body': json.dumps({'error': 'Доступ запрещен'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                data = json.loads(event.get('body', '{}'))
                application_id = data.get('id')
                status = data.get('status')
                
                cur.execute("""
                    SELECT a.id FROM applications a
                    JOIN vacancies v ON a.vacancy_id = v.id
                    WHERE a.id = %s AND v.employer_id = %s
                """, (application_id, user['id']))
                
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': headers,
                        'body': json.dumps({'error': 'Доступ запрещен'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    UPDATE applications 
                    SET status = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (status, application_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Статус обновлен'}, ensure_ascii=False),
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
