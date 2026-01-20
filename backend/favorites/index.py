"""API для управления избранными вакансиями"""
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
    """API endpoint для работы с избранным"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
                cur.execute("""
                    SELECT v.*, u.full_name as employer_name, f.created_at as favorited_at
                    FROM favorites f
                    JOIN vacancies v ON f.vacancy_id = v.id
                    JOIN users u ON v.employer_id = u.id
                    WHERE f.user_id = %s
                    ORDER BY f.created_at DESC
                """, (user['id'],))
                
                favorites = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(f) for f in favorites], ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                data = json.loads(event.get('body', '{}'))
                vacancy_id = data.get('vacancy_id')
                
                try:
                    cur.execute("""
                        INSERT INTO favorites (user_id, vacancy_id)
                        VALUES (%s, %s)
                        RETURNING id
                    """, (user['id'], vacancy_id))
                    
                    favorite_id = cur.fetchone()['id']
                    conn.commit()
                    
                    return {
                        'statusCode': 201,
                        'headers': headers,
                        'body': json.dumps({'id': favorite_id, 'message': 'Добавлено в избранное'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                except psycopg2.IntegrityError:
                    conn.rollback()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Уже в избранном'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
            
            elif method == 'DELETE':
                params = event.get('queryStringParameters') or {}
                vacancy_id = params.get('vacancy_id')
                
                cur.execute("""
                    DELETE FROM favorites
                    WHERE user_id = %s AND vacancy_id = %s
                """, (user['id'], vacancy_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Удалено из избранного'}, ensure_ascii=False),
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
