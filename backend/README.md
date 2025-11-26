# Backend

Spring Boot backend for the Vite demo project.

## Endpoints
- GET `/api/employees?email={email}` -> returns employee JSON or null
- GET `/api/employees/{id}/salary` -> returns salary history array

## Run with Maven

```bash
mvn -f backend/ spring-boot:run
```

## Database initialization

The backend expects a local MySQL database named `employeedb`. A helper SQL script is provided at:

`src/main/resources/db/init_employeedb.sql`

To create the database and sample data, run (replace `root` with your DB user as needed):

```bash
cd backend
mysql -u root -p < src/main/resources/db/init_employeedb.sql
```

After running the script, ensure your `application.properties` datasource settings match the DB credentials and host.
Spring Boot backend for the Vite demo project.

Endpoints:
- GET /api/employees?email={email} -> returns employee JSON or null
- GET /api/employees/{id}/salary -> returns salary history array

Run with Maven:

mvn -f backend/ spring-boot:run

