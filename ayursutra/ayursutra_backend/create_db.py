import sqlalchemy

try:
    engine = sqlalchemy.create_engine("mysql+pymysql://root:@localhost:3306/")
    with engine.connect() as conn:
        conn.execute(sqlalchemy.text("CREATE DATABASE IF NOT EXISTS ayursutra;"))
    print("Database created successfully without password.")
except Exception as e:
    print(f"Failed without password: {e}")
    try:
        engine = sqlalchemy.create_engine("mysql+pymysql://root:Deep%400302@localhost:3306/")
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("CREATE DATABASE IF NOT EXISTS ayursutra;"))
        print("Database created successfully with 'password'.")
    except Exception as e2:
        print(f"Failed with password: {e2}")
