from flask import Flask, request, jsonify
from math import radians, sin, cos, sqrt, atan2

app = Flask(__name__)


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates in kilometers.
    """

    R = 6371.0

    lat1 = radians(float(lat1))
    lon1 = radians(float(lon1))
    lat2 = radians(float(lat2))
    lon2 = radians(float(lon2))

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


def normalize(value):
    if value is None:
        return ""

    return str(value).strip().lower()


def cuisine_match(user_cuisine, chef_cuisines):
    """
    Calculate cuisine matching score.
    """

    if not user_cuisine:
        return 100

    user_cuisine = normalize(user_cuisine)

    if isinstance(chef_cuisines, str):
        chef_cuisines = [chef_cuisines]

    if not isinstance(chef_cuisines, list):
        return 0

    for cuisine in chef_cuisines:
        if user_cuisine == normalize(cuisine):
            return 100

    return 0


def calculate_recommendation_score(user, chef):

    user_city = normalize(user.get("city"))
    chef_city = normalize(chef.get("city"))
    is_same_city = (
        chef.get("is_same_city", False) or
        (bool(user_city) and user_city == chef_city)
    )

    # -------------------------------------------------
    # 1. Cuisine - 30%
    # -------------------------------------------------

    cuisine_score = cuisine_match(
        user.get("cuisine"),
        chef.get("cuisines", [])
    )


    # -------------------------------------------------
    # 2. Location / Distance - 25%
    # -------------------------------------------------

    if is_same_city:
        distance = 0.0
        location_score = 100
    else:
        try:

            user_lat = float(user["latitude"])
            user_lng = float(user["longitude"])

            chef_lat = float(chef["latitude"])
            chef_lng = float(chef["longitude"])

            distance = calculate_distance(
                user_lat,
                user_lng,
                chef_lat,
                chef_lng
            )

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

        except (KeyError, TypeError, ValueError):

            distance = None
            location_score = 0


    # -------------------------------------------------
    # 3. Availability - 20%
    # -------------------------------------------------

    availability_score = (
        100
        if chef.get("available", False)
        else 0
    )


    # -------------------------------------------------
    # 4. Experience - 15%
    # -------------------------------------------------

    try:

        experience = float(
            chef.get("experience", 0)
        )

        experience_score = min(
            experience / 10,
            1
        ) * 100

    except (TypeError, ValueError):

        experience_score = 0


    # -------------------------------------------------
    # 5. Rating - 10%
    # -------------------------------------------------

    try:

        rating = float(
            chef.get("rating", 0)
        )

        rating_score = (
            rating / 5
        ) * 100

    except (TypeError, ValueError):

        rating_score = 0


    # -------------------------------------------------
    # Final Weighted Score
    # -------------------------------------------------

    final_score = (
        cuisine_score * 0.30
        + location_score * 0.25
        + availability_score * 0.20
        + experience_score * 0.15
        + rating_score * 0.10
    )


    return round(final_score, 2), distance, is_same_city


@app.route("/recommend", methods=["POST"])
def recommend():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400


        user = data.get("user", {})
        chefs = data.get("chefs", [])


        if not chefs:

            return jsonify({
                "success": True,
                "recommendations": []
            })


        recommendations = []


        for chef in chefs:

            score, calculated_distance, is_same_city = (
                calculate_recommendation_score(
                    user,
                    chef
                )
            )


            recommendations.append({

                "chef_id": chef.get("id"),

                "name": chef.get("name"),

                "score": score,

                "is_same_city": is_same_city,

                "distance_km": (
                    0.0 if is_same_city else (
                        round(calculated_distance, 2)
                        if calculated_distance is not None
                        else chef.get("distance", 0)
                    )
                ),

                "cuisines": chef.get(
                    "cuisines",
                    []
                ),

                "experience": chef.get(
                    "experience",
                    0
                ),

                "rating": chef.get(
                    "rating",
                    0
                ),

                "available": chef.get(
                    "available",
                    False
                ),

                "suggestion": (
                    f"Chef {chef.get('name', 'Chef')} is available on Chef!"
                    if chef.get("available", True)
                    else f"Chef {chef.get('name', 'Chef')} is currently unavailable on Chef."
                )
            })


        # Same city chefs come FIRST, then sort by highest AI score
        recommendations.sort(
            key=lambda item: (item["is_same_city"], item["score"]),
            reverse=True
        )


        return jsonify({

            "success": True,

            "recommendations": recommendations

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )