import json
import os
import psycopg2

SCHEMA = "t_p48470894_whatsapp_alternative"

def handler(event: dict, context) -> dict:
    """Заявки: GET список, POST создать/откликнуться"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        return get_orders(event)
    elif method == 'POST':
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', 'create')
        if action == 'respond':
            return respond_order(body)
        return create_order(body)

    return {'statusCode': 405, 'headers': cors(), 'body': json.dumps({'ok': False})}


def get_orders(event):
    params = event.get('queryStringParameters') or {}
    city = (params.get('city') or '').strip()
    # admin видит все статусы, обычные — active + closed
    show_all = params.get('all') == '1'

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    city_filter = "AND city = '%s'" % city.replace("'", "''") if city else ""
    status_filter = "" if show_all else "AND status IN ('active', 'closed')"

    cur.execute("""
        SELECT id, city, address, workers_count, work_date, work_time,
               description, rate, min_hours, contact_name, status,
               responses_count, created_at
        FROM %s.orders
        WHERE 1=1 %s %s
        ORDER BY
          CASE status WHEN 'active' THEN 0 WHEN 'closed' THEN 1 ELSE 2 END,
          created_at DESC
    """ % (SCHEMA, city_filter, status_filter))

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
            'responsesCount': r[11],
            'createdAt': str(r[12])
        })

    return {'statusCode': 200, 'headers': cors(),
            'body': json.dumps({'ok': True, 'orders': orders}, ensure_ascii=False)}


def respond_order(body):
    order_id = body.get('orderId')
    user_id  = body.get('userId')

    if not order_id or not user_id:
        return {'statusCode': 400, 'headers': cors(),
                'body': json.dumps({'ok': False, 'error': 'orderId и userId обязательны'}, ensure_ascii=False)}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    # Проверяем заявку
    cur.execute("SELECT id, workers_count, responses_count, status FROM %s.orders WHERE id = %d" % (SCHEMA, int(order_id)))
    order = cur.fetchone()
    if not order:
        cur.close(); conn.close()
        return {'statusCode': 404, 'headers': cors(),
                'body': json.dumps({'ok': False, 'error': 'Заявка не найдена'}, ensure_ascii=False)}

    if order[3] == 'closed':
        cur.close(); conn.close()
        return {'statusCode': 409, 'headers': cors(),
                'body': json.dumps({'ok': False, 'error': 'Набор уже закрыт'}, ensure_ascii=False)}

    # Проверяем повторный отклик
    cur.execute("SELECT id FROM %s.responses WHERE order_id = %d AND user_id = %d" % (SCHEMA, int(order_id), int(user_id)))
    if cur.fetchone():
        cur.close(); conn.close()
        return {'statusCode': 409, 'headers': cors(),
                'body': json.dumps({'ok': False, 'error': 'Вы уже откликались на эту заявку'}, ensure_ascii=False)}

    # Записываем отклик
    cur.execute("INSERT INTO %s.responses (order_id, user_id) VALUES (%d, %d)" % (SCHEMA, int(order_id), int(user_id)))

    # Увеличиваем счётчик
    new_count = order[2] + 1
    workers_needed = order[1]

    # Автозакрытие если набралось нужное количество
    new_status = 'closed' if new_count >= workers_needed else 'active'
    cur.execute("UPDATE %s.orders SET responses_count = %d, status = '%s' WHERE id = %d" % (
        SCHEMA, new_count, new_status, int(order_id)
    ))

    conn.commit(); cur.close(); conn.close()

    return {'statusCode': 200, 'headers': cors(),
            'body': json.dumps({
                'ok': True,
                'responsesCount': new_count,
                'status': new_status,
                'closed': new_status == 'closed'
            }, ensure_ascii=False)}


def create_order(body):
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
        return {'statusCode': 400, 'headers': cors(),
                'body': json.dumps({'ok': False, 'errors': errors}, ensure_ascii=False)}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO %s.orders (city, address, workers_count, work_date, work_time, description, rate, min_hours, contact_name)
        VALUES ('%s', '%s', %d, '%s', '%s', '%s', %d, %d, '%s')
        RETURNING id, created_at
    """ % (
        SCHEMA,
        city.replace("'", "''"), address.replace("'", "''"),
        int(workers), work_date.replace("'", "''"), work_time.replace("'", "''"),
        description.replace("'", "''"), int(rate), int(min_hours),
        contact_name.replace("'", "''"),
    ))
    row = cur.fetchone()
    conn.commit(); cur.close(); conn.close()

    return {'statusCode': 200, 'headers': cors(),
            'body': json.dumps({'ok': True, 'order': {'id': row[0], 'createdAt': str(row[1])}}, ensure_ascii=False)}


def cors():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
