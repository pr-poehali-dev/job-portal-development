import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_from_token(event: dict):
    """Получение пользователя по токену"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return None
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.id, u.email, u.full_name, u.user_type
                   FROM user_sessions s
                   JOIN users u ON s.user_id = u.id
                   WHERE s.session_token = %s AND s.expires_at > NOW()""",
                (token,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def handler(event: dict, context) -> dict:
    """API для управления резюме"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user = get_user_from_token(event)
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходима авторизация'}),
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            return get_resume(user)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            return create_resume(user, body)
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            return update_resume(user, body)
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            return delete_resume(user, body)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не разрешён'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

def get_resume(user: dict) -> dict:
    """Получение резюме пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT * FROM resumes WHERE user_id = %s ORDER BY created_at DESC LIMIT 1""",
                (user['id'],)
            )
            resume = cur.fetchone()
            
            if not resume:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Резюме не найдено'}),
                    'isBase64Encoded': False
                }
            
            resume_id = resume['id']
            
            cur.execute(
                """SELECT * FROM resume_experience WHERE resume_id = %s ORDER BY start_date DESC""",
                (resume_id,)
            )
            experience = cur.fetchall()
            
            cur.execute(
                """SELECT * FROM resume_education WHERE resume_id = %s ORDER BY start_date DESC""",
                (resume_id,)
            )
            education = cur.fetchall()
            
            cur.execute(
                """SELECT * FROM resume_skills WHERE resume_id = %s""",
                (resume_id,)
            )
            skills = cur.fetchall()
            
            resume_data = dict(resume)
            resume_data['experience'] = [dict(exp) for exp in experience]
            resume_data['education'] = [dict(edu) for edu in education]
            resume_data['skills'] = [dict(skill) for skill in skills]
            
            for key, value in resume_data.items():
                if isinstance(value, datetime):
                    resume_data[key] = value.isoformat()
            
            for exp in resume_data['experience']:
                for key, value in exp.items():
                    if isinstance(value, datetime):
                        exp[key] = value.isoformat()
            
            for edu in resume_data['education']:
                for key, value in edu.items():
                    if isinstance(value, datetime):
                        edu[key] = value.isoformat()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'resume': resume_data}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def create_resume(user: dict, body: dict) -> dict:
    """Создание нового резюме"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO resumes (
                    user_id, title, full_name, email, phone, location, 
                    position, salary_min, salary_max, about_me, photo_url, is_published
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id""",
                (
                    user['id'],
                    body.get('title', 'Моё резюме'),
                    body.get('full_name', user['full_name']),
                    body.get('email', user['email']),
                    body.get('phone'),
                    body.get('location'),
                    body.get('position'),
                    body.get('salary_min'),
                    body.get('salary_max'),
                    body.get('about_me'),
                    body.get('photo_url'),
                    body.get('is_published', False)
                )
            )
            resume_id = cur.fetchone()['id']
            
            for exp in body.get('experience', []):
                cur.execute(
                    """INSERT INTO resume_experience (
                        resume_id, company, position, start_date, end_date, is_current, description
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (
                        resume_id,
                        exp.get('company'),
                        exp.get('position'),
                        exp.get('start_date'),
                        exp.get('end_date'),
                        exp.get('is_current', False),
                        exp.get('description')
                    )
                )
            
            for edu in body.get('education', []):
                cur.execute(
                    """INSERT INTO resume_education (
                        resume_id, institution, degree, field_of_study, start_date, end_date, is_current
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (
                        resume_id,
                        edu.get('institution'),
                        edu.get('degree'),
                        edu.get('field_of_study'),
                        edu.get('start_date'),
                        edu.get('end_date'),
                        edu.get('is_current', False)
                    )
                )
            
            for skill in body.get('skills', []):
                cur.execute(
                    """INSERT INTO resume_skills (resume_id, skill_name, skill_level)
                       VALUES (%s, %s, %s)""",
                    (resume_id, skill.get('skill_name'), skill.get('skill_level'))
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'resume_id': resume_id}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def update_resume(user: dict, body: dict) -> dict:
    """Обновление резюме"""
    resume_id = body.get('id')
    if not resume_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'ID резюме обязателен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM resumes WHERE id = %s AND user_id = %s", (resume_id, user['id']))
            if not cur.fetchone():
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Нет доступа к этому резюме'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """UPDATE resumes SET 
                    title = %s, full_name = %s, email = %s, phone = %s, location = %s,
                    position = %s, salary_min = %s, salary_max = %s, about_me = %s,
                    photo_url = %s, is_published = %s, updated_at = NOW()
                WHERE id = %s""",
                (
                    body.get('title'),
                    body.get('full_name'),
                    body.get('email'),
                    body.get('phone'),
                    body.get('location'),
                    body.get('position'),
                    body.get('salary_min'),
                    body.get('salary_max'),
                    body.get('about_me'),
                    body.get('photo_url'),
                    body.get('is_published', False),
                    resume_id
                )
            )
            
            cur.execute("DELETE FROM resume_experience WHERE resume_id = %s", (resume_id,))
            cur.execute("DELETE FROM resume_education WHERE resume_id = %s", (resume_id,))
            cur.execute("DELETE FROM resume_skills WHERE resume_id = %s", (resume_id,))
            
            for exp in body.get('experience', []):
                cur.execute(
                    """INSERT INTO resume_experience (
                        resume_id, company, position, start_date, end_date, is_current, description
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (
                        resume_id,
                        exp.get('company'),
                        exp.get('position'),
                        exp.get('start_date'),
                        exp.get('end_date'),
                        exp.get('is_current', False),
                        exp.get('description')
                    )
                )
            
            for edu in body.get('education', []):
                cur.execute(
                    """INSERT INTO resume_education (
                        resume_id, institution, degree, field_of_study, start_date, end_date, is_current
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (
                        resume_id,
                        edu.get('institution'),
                        edu.get('degree'),
                        edu.get('field_of_study'),
                        edu.get('start_date'),
                        edu.get('end_date'),
                        edu.get('is_current', False)
                    )
                )
            
            for skill in body.get('skills', []):
                cur.execute(
                    """INSERT INTO resume_skills (resume_id, skill_name, skill_level)
                       VALUES (%s, %s, %s)""",
                    (resume_id, skill.get('skill_name'), skill.get('skill_level'))
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def delete_resume(user: dict, body: dict) -> dict:
    """Удаление резюме"""
    resume_id = body.get('id')
    if not resume_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'ID резюме обязателен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM resumes WHERE id = %s AND user_id = %s", (resume_id, user['id']))
            if not cur.fetchone():
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Нет доступа к этому резюме'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("UPDATE resumes SET updated_at = NOW() WHERE id = %s", (resume_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
