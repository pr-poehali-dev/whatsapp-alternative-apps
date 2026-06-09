import json
import os
import re
import psycopg2

def handler(event: dict, context) -> dict:
    """Регистрация нового пользователя в системе Gruz off"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')

    first_name = (body.get('firstName') or '').strip()
    last_name  = (body.get('lastName') or '').strip()
    city       = (body.get('city') or '').strip()
    age        = body.get('age')
    phone      = (body.get('phone') or '').strip()
    role       = 'user'

    # Валидация
    errors = {}
    if not first_name:
        errors['firstName'] = 'Введите имя'
    if not last_name:
        errors['lastName'] = 'Введите фамилию'
    if not city:
        errors['city'] = 'Выберите город'
    if age is None:
        errors['age'] = 'Введите возраст'
    elif int(age) < 20:
        errors['age'] = 'Регистрация только от 20 лет'
    elif int(age) > 80:
        errors['age'] = 'Некорректный возраст'
    if not phone:
        errors['phone'] = 'Введите номер телефона'
    elif not re.match(r'^\+7\d{10}$', phone):
        errors['phone'] = 'Формат: +7XXXXXXXXXX'

    if errors:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': False, 'errors': errors}, ensure_ascii=False)
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    # Проверка дубля по телефону
    cur.execute(
        "SELECT id FROM t_p48470894_whatsapp_alternative.users WHERE phone = '%s'" % phone
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 409,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': False, 'errors': {'phone': 'Этот номер уже зарегистрирован'}}, ensure_ascii=False)
        }

    cur.execute(
        """INSERT INTO t_p48470894_whatsapp_alternative.users
           (first_name, last_name, city, age, phone, role)
           VALUES ('%s', '%s', '%s', %d, '%s', '%s')
           RETURNING id, created_at""" % (
            first_name.replace("'", "''"),
            last_name.replace("'", "''"),
            city.replace("'", "''"),
            int(age),
            phone.replace("'", "''"),
            role
        )
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'ok': True,
            'user': {
                'id': row[0],
                'firstName': first_name,
                'lastName': last_name,
                'city': city,
                'age': int(age),
                'phone': phone,
                'role': role,
                'createdAt': str(row[1]),
            }
        }, ensure_ascii=False)
    }
