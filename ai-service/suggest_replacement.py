import sys
import os
import argparse
import mysql.connector
import json
from math import radians, sin, cos, sqrt, atan2

# Exact distance function from ai_service.py
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371.0

    lat1 = radians(float(lat1))
    lon1 = radians(float(lon1))
    lat2 = radians(float(lat2))
    lon2 = radians(float(lon2))

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c

def normalize(value):
    if value is None:
        return ""
    return str(value).strip().lower()

def cuisine_match(user_cuisine, chef_cuisines):
    if not user_cuisine:
        return 100
    user_cuisine = normalize(user_cuisine)
    
    if isinstance(chef_cuisines, str):
        try:
            chef_cuisines = json.loads(chef_cuisines)
        except Exception:
            chef_cuisines = [chef_cuisines]
            
    if not isinstance(chef_cuisines, list):
        return 0

    for cuisine in chef_cuisines:
        if user_cuisine == normalize(cuisine):
            return 100
    return 0

def load_env(env_path):
    env_vars = {}
    if not os.path.exists(env_path):
        return env_vars
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, val = line.split('=', 1)
            env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--booking_id', type=int, required=True)
    args = parser.parse_args()

    # Load DB credentials from .env
    env_path = os.path.join(os.path.dirname(__file__), '../backend/.env')
    env = load_env(env_path)

    db_host = env.get('DB_HOST', '127.0.0.1')
    db_port = int(env.get('DB_PORT', 3306))
    db_database = env.get('DB_DATABASE', 'chef-hiring-system')
    db_username = env.get('DB_USERNAME', 'root')
    db_password = env.get('DB_PASSWORD', '')

    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(
            host=db_host,
            port=db_port,
            database=db_database,
            user=db_username,
            password=db_password
        )
        cursor = conn.cursor(dictionary=True)

        # 1. Fetch booking details and customer city
        cursor.execute("""
            SELECT b.chef_id, b.event_type, u.city
            FROM bookings b
            JOIN users u ON b.customer_id = u.id
            WHERE b.id = %s
        """, (args.booking_id,))
        booking = cursor.fetchone()

        if not booking:
            print(f"Booking with ID {args.booking_id} not found.")
            return

        current_chef_id = booking['chef_id']
        event_type = booking['event_type']
        customer_city = booking['city'] or 'Colombo'

        # Coordinates map matching DashboardController
        city_coordinates = {
            'Colombo': (6.927179, 79.861244),
            'Nugegoda': (6.901500, 79.880000),
            'Kandy': (7.290572, 80.633728),
            'Galle': (6.053519, 80.220978),
            'Negombo': (7.208300, 79.835800),
        }

        user_coords = city_coordinates.get(customer_city, city_coordinates['Colombo'])
        user_lat, user_lng = user_coords

        # 2. Fetch other active available chefs
        cursor.execute("""
            SELECT u.id, u.name, cp.experience_years, cp.cuisine_specialities, cp.hourly_rate, cp.availability_status, cp.latitude, cp.longitude, cp.rating
            FROM users u
            JOIN chef_profiles cp ON u.id = cp.user_id
            WHERE u.role = 'chef' AND u.status = 'active' AND cp.availability_status = 'available' AND u.id != %s
        """, (current_chef_id,))
        chefs = cursor.fetchall()

        if not chefs:
            print("No active available replacement chefs found.")
            return

        scored_chefs = []
        for chef in chefs:
            # 1. Cuisine Score - 30%
            cuisines_raw = chef['cuisine_specialities']
            cuisine_score = cuisine_match(event_type, cuisines_raw)

            # 2. Location Score - 25%
            try:
                chef_lat = float(chef['latitude']) if chef['latitude'] is not None else user_lat
                chef_lng = float(chef['longitude']) if chef['longitude'] is not None else user_lng
                distance = calculate_distance(user_lat, user_lng, chef_lat, chef_lng)

                if distance <= 5:
                    location_score = 100
                elif distance <= 10:
                    location_score = 85
                elif distance <= 20:
                    location_score = 70
                elif distance <= 30:
                    location_score = 50
                else:
                    location_score = 25
            except Exception:
                location_score = 0

            # 3. Availability - 20%
            availability_score = 100

            # 4. Experience - 15%
            try:
                experience = float(chef['experience_years'] or 0)
                experience_score = min(experience / 10, 1) * 100
            except Exception:
                experience_score = 0

            # 5. Rating - 10%
            try:
                rating = float(chef['rating'] or 0)
                rating_score = (rating / 5) * 100
            except Exception:
                rating_score = 0

            # Calculate weighted final score
            final_score = (
                cuisine_score * 0.30 +
                location_score * 0.25 +
                availability_score * 0.20 +
                experience_score * 0.15 +
                rating_score * 0.10
            )

            scored_chefs.append({
                'chef_id': chef['id'],
                'score': final_score
            })

        # Sort scored chefs by score descending
        scored_chefs.sort(key=lambda x: x['score'], reverse=True)
        best_chef_id = scored_chefs[0]['chef_id']

        # Update the booking row with suggested_chef_id
        cursor.execute("""
            UPDATE bookings
            SET suggested_chef_id = %s
            WHERE id = %s
        """, (best_chef_id, args.booking_id))
        conn.commit()

        print(f"Successfully suggested Chef ID {best_chef_id} for Booking ID {args.booking_id} (Score: {scored_chefs[0]['score']})")

    except Exception as e:
        print(f"Error suggesting replacement chef: {e}", file=sys.stderr)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    main()
