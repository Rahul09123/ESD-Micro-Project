Spring Boot backend for the Vite demo project.

Endpoints:
- GET /api/employees?email={email} -> returns employee JSON or null
- GET /api/employees/{id}/salary -> returns salary history array

Run with Maven:

mvn -f backend/ spring-boot:run

