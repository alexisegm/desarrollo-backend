Resource: Request
Endpoints:
- GET /requests
- GET /requests/:id
- POST /requests
Expected statuses:
- 200 for successful queries
- 201 when a request is created
- 400 when required data (title) is missing or blank
- 404 when a request does not exist
Representation:
- JSON
Storage:
- In memory (using provided data/requests.js)
Excluded:
- Database, Authentication, TypeScript
- Controllers, Services, Repository layers
- Update (PUT/PATCH) and delete (DELETE) operations