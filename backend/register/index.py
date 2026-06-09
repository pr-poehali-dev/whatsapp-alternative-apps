import json
import os
import re
import hashlib
import psycopg2

SCHEMA = "t_p48470894_whatsapp_alternative"

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def cors():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

def handler(event: dict, context) -> dict:
    """Регистрация (action=register) и вход (action=login) для Gruz off"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', 'register')

    if action == 'login':
        return do_login(body)
    return do_register(body)


def do_register(body):
    first_name = (body.get('firstName') or '').strip()
    last_name  = (body.get('lastName') or '').strip()
    city       = (body.get('city') or '').strip()
    age        = body.get('age')
    phone      = (body.get('phone') or '').strip()
    password   = (body.get('password') or '').strip()

    errors = {}
    if not first_name:  errors['firstName'] = 'Введите имя'
    if not last_name:   errors['lastName']  = 'Введите фамилию'
    if not city:        errors['city']      = 'Выберите город'
    if age is None:     errors['age']       = 'Введите возраст'
    elif int(age) < 20: errors['age']       = 'Регистрация только от 20 лет'
    elif int(age) > 80: errors['age']       = 'Некорректный возраст'
    if not phone:
        errors['phone'] = 'Введите номер телефона'
    elif not re.match(r'^\+7\d{10}$', phone):
        errors['phone'] = 'Формат: +7XXXXXXXXXX'
    if not password:
        errors['password'] = 'Введите пароль'
    elif len(password) < 6:
        errors['password'] = 'Минимум 6 символов'

    if errors:
        return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'ok': False, 'errors': errors}, ensure_ascii=False)}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("SELECT id FROM %s.users WHERE phone = '%s'" % (SCHEMA, phone.replace("'", "''")))
    if cur.fetchone():
        cur.close(); conn.close()
        return {'statusCode': 409, 'headers': cors(), 'body': json.dumps({'ok': False, 'errors': {'phone': 'Этот номер уже зарегистрирован'}}, ensure_ascii=False)}

    cur.execute("""
        INSERT INTO %s.users (first_name, last_name, city, age, phone, role, password_hash)
        VALUES ('%s', '%s', '%s', %d, '%s', 'user', '%s')
        RETURNING id
    """ % (
        SCHEMA,
        first_name.replace("'", "''"), last_name.replace("'", "''"),
        city.replace("'", "''"), int(age),
        phone.replace("'", "''"), hash_password(password),
    ))
    row = cur.fetchone()
    conn.commit(); cur.close(); conn.close()

    return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({
        'ok': True,
        'user': {'id': row[0], 'firstName': first_name, 'lastName': last_name, 'city': city, 'age': int(age), 'phone': phone, 'role': 'user'}
    }, ensure_ascii=False)}


def do_login(body):
    phone    = (body.get('phone') or '').strip()
    password = (body.get('password') or '').strip()

    errors = {}
    if not phone:
        errors['phone'] = 'Введите номер телефона'
    elif not re.match(r'^\+7\d{10}$', phone):
        errors['phone'] = 'Формат: +7XXXXXXXXXX'
    if not password:
        errors['password'] = 'Введите пароль'
    elif len(password) < 6:
        errors['password'] = 'Минимум 6 символов'

    if errors:
        return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'ok': False, 'errors': errors}, ensure_ascii=False)}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute("""
        SELECT id, first_name, last_name, city, age, phone, role, password_hash
        FROM %s.users WHERE phone = '%s'
    """ % (SCHEMA, phone.replace("'", "''")))
    row = cur.fetchone()
    cur.close(); conn.close()

    if not row:
        return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'ok': False, 'errors': {'phone': 'Номер не зарегистрирован'}}, ensure_ascii=False)}

    if row[7] != hash_password(password):
        return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'ok': False, 'errors': {'password': 'Неверный пароль'}}, ensure_ascii=False)}

    return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({
        'ok': True,
        'user': {'id': row[0], 'firstName': row[1], 'lastName': row[2], 'city': row[3], 'age': row[4], 'phone': row[5], 'role': row[6]}
    }, ensure_ascii=False)}
