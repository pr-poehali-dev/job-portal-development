import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    """Хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_session_token() -> str:
    """Генерация токена сессии"""
    return secrets.token_urlsafe(32)

def handler(event: dict, context) -> dict:
    """API для регистрации, авторизации и управления профилем пользователей"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        return get_profile(event)
    
    if method == 'PUT':
        return update_profile(event)
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не разрешён'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'register':
            return register_user(body)
        elif action == 'login':
            return login_user(body)
        elif action == 'verify':
            return verify_session(event)
        elif action == 'logout':
            return logout_user(event)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

def register_user(body: dict) -> dict:
    """Регистрация нового пользователя"""
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    full_name = body.get('full_name', '').strip()
    user_type = body.get('user_type', 'candidate')
    
    if not email or not password or not full_name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email, пароль и имя обязательны'}),
            'isBase64Encoded': False
        }
    
    if user_type not in ['candidate', 'company']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный тип пользователя'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            cur.execute(
                """INSERT INTO users (email, password_hash, full_name, user_type) 
                   VALUES (%s, %s, %s, %s) RETURNING id, email, full_name, user_type, created_at""",
                (email, password_hash, full_name, user_type)
            )
            user = cur.fetchone()
            
            session_token = generate_session_token()
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                """INSERT INTO user_sessions (user_id, session_token, expires_at) 
                   VALUES (%s, %s, %s)""",
                (user['id'], session_token, expires_at)
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'session_token': session_token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'user_type': user['user_type']
                    }
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def login_user(body: dict) -> dict:
    """Вход пользователя"""
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email и пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            password_hash = hash_password(password)
            cur.execute(
                """SELECT id, email, full_name, user_type 
                   FROM users WHERE email = %s AND password_hash = %s""",
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'}),
                    'isBase64Encoded': False
                }
            
            session_token = generate_session_token()
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                """INSERT INTO user_sessions (user_id, session_token, expires_at) 
                   VALUES (%s, %s, %s)""",
                (user['id'], session_token, expires_at)
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'session_token': session_token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'user_type': user['user_type']
                    }
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def verify_session(event: dict) -> dict:
    """Проверка сессии"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен не предоставлен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.id, u.email, u.full_name, u.user_type, s.expires_at
                   FROM user_sessions s
                   JOIN users u ON s.user_id = u.id
                   WHERE s.session_token = %s""",
                (token,)
            )
            result = cur.fetchone()
            
            if not result:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный токен'}),
                    'isBase64Encoded': False
                }
            
            if result['expires_at'] < datetime.now():
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Сессия истекла'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': result['id'],
                        'email': result['email'],
                        'full_name': result['full_name'],
                        'user_type': result['user_type']
                    }
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def logout_user(event: dict) -> dict:
    """Выход пользователя"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен не предоставлен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("UPDATE user_sessions SET expires_at = NOW() WHERE session_token = %s", (token,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Выход выполнен успешно'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def get_user_from_session(session_token: str):
    """Получение пользователя по токену сессии"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.id, u.email, u.full_name, u.user_type, u.created_at
                   FROM user_sessions s
                   JOIN users u ON s.user_id = u.id
                   WHERE s.session_token = %s AND s.expires_at > NOW()""",
                (session_token,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def get_profile(event: dict) -> dict:
    """Получение данных профиля пользователя"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    session_token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not session_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    user = get_user_from_session(session_token)
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Сессия истекла'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'profile': {
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'user_type': user['user_type'],
                'created_at': user['created_at'].isoformat()
            }
        }),
        'isBase64Encoded': False
    }

def update_profile(event: dict) -> dict:
    """Обновление данных профиля пользователя"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    session_token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not session_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    user = get_user_from_session(session_token)
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Сессия истекла'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        full_name = body.get('full_name', '').strip()
        email = body.get('email', '').strip().lower()
        current_password = body.get('current_password', '')
        new_password = body.get('new_password', '')
        
        if not full_name and not email and not new_password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Нет данных для обновления'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if email and email != user['email']:
                    cur.execute("SELECT id FROM users WHERE email = %s AND id != %s", (email, user['id']))
                    if cur.fetchone():
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Email уже используется'}),
                            'isBase64Encoded': False
                        }
                
                if new_password:
                    if not current_password:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Укажите текущий пароль'}),
                            'isBase64Encoded': False
                        }
                    
                    cur.execute("SELECT password_hash FROM users WHERE id = %s", (user['id'],))
                    result = cur.fetchone()
                    if hash_password(current_password) != result['password_hash']:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Неверный текущий пароль'}),
                            'isBase64Encoded': False
                        }
                    
                    password_hash = hash_password(new_password)
                    cur.execute(
                        "UPDATE users SET password_hash = %s, updated_at = NOW() WHERE id = %s",
                        (password_hash, user['id'])
                    )
                
                update_parts = []
                params = []
                
                if full_name:
                    update_parts.append("full_name = %s")
                    params.append(full_name)
                
                if email and email != user['email']:
                    update_parts.append("email = %s")
                    params.append(email)
                
                if update_parts:
                    update_parts.append("updated_at = NOW()")
                    params.append(user['id'])
                    cur.execute(
                        f"UPDATE users SET {', '.join(update_parts)} WHERE id = %s RETURNING id, email, full_name, user_type",
                        params
                    )
                    updated_user = cur.fetchone()
                else:
                    cur.execute(
                        "SELECT id, email, full_name, user_type FROM users WHERE id = %s",
                        (user['id'],)
                    )
                    updated_user = cur.fetchone()
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Профиль обновлён',
                        'profile': {
                            'id': updated_user['id'],
                            'email': updated_user['email'],
                            'full_name': updated_user['full_name'],
                            'user_type': updated_user['user_type']
                        }
                    }),
                    'isBase64Encoded': False
                }
        finally:
            conn.close()
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }