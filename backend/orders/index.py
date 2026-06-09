import json
import os
import psycopg2

SCHEMA = "t_p48470894_whatsapp_alternative"

def handler(event: dict, context) -> dict:
    """Создание заявки (POST) и получение заявок по городу (GET)"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        return get_orders(event)
    elif method == 'POST':
        return create_order(event)

    return {'statusCode': 405, 'headers': cors(), 'body': json.dumps({'ok': False, 'error': 'Method not allowed'})}


def get_orders(event):
    params = event.get('queryStringParameters') or {}
    city = (params.get('city') or '').strip()

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if city:
        cur.execute("""
            SELECT id, city, address, workers_count, work_date, work_time,
                   description, rate, min_hours, contact_name, status, created_at
            FROM %s.orders
            WHERE city = '%s' AND status = 'active'
            ORDER BY created_at DESC
        """ % (SCHEMA, city.replace("'", "''")))
    else:
        cur.execute("""
            SELECT id, city, address, workers_count, work_date, work_time,
                   description, rate, min_hours, contact_name, status, created_at
            FROM %s.orders
            WHERE status = 'active'
            ORDER BY created_at DESC
        """ % SCHEMA)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    orders = []
    for r in rows:
        orders.append({
            'id': r[0], 'city': r[1], 'address': r[2],
            'workersCount': r[3], 'workDate': r[4], 'workTime': r[5],
            'description': r[6], 'rate': r[7], 'minHours': r[8],
            'contactName': r[9], 'status': r[10],
            'createdAt': str(r[11])
        })

    return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'ok': True, 'orders': orders}, ensure_ascii=False)}


def create_order(event):
    body = json.loads(event.get('body') or '{}')

    city         = (body.get('city') or '').strip()
    address      = (body.get('address') or '').strip()
    workers      = body.get('workersCount', 1)
    work_date    = (body.get('workDate') or '').strip()
    work_time    = (body.get('workTime') or '').strip()
    description  = (body.get('description') or '').strip()
    rate         = body.get('rate', 0)
    min_hours    = body.get('minHours', 2)
    contact_name = (body.get('contactName') or '').strip()

    errors = {}
    if not city:        errors['city'] = 'Укажите город'
    if not work_date:   errors['workDate'] = 'Укажите дату'
    if not description: errors['description'] = 'Опишите работу'
    if not rate:        errors['rate'] = 'Укажите оплату в час'

    if errors:
        return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'ok': False, 'errors': errors}, ensure_ascii=False)}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO %s.orders (city, address, workers_count, work_date, work_time, description, rate, min_hours, contact_name)
        VALUES ('%s', '%s', %d, '%s', '%s', '%s', %d, %d, '%s')
        RETURNING id, created_at
    """ % (
        SCHEMA,
        city.replace("'", "''"),
        address.replace("'", "''"),
        int(workers),
        work_date.replace("'", "''"),
        work_time.replace("'", "''"),
        description.replace("'", "''"),
        int(rate),
        int(min_hours),
        contact_name.replace("'", "''"),
    ))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({
        'ok': True,
        'order': {'id': row[0], 'createdAt': str(row[1])}
    }, ensure_ascii=False)}


def cors():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
