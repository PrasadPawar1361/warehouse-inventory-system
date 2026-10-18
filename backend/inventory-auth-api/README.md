# Inventory Management Authentication API

Spring Boot + Java 21 + MySQL + Spring Security + JWT. Intended as the authentication module for the AI & Robotics Based Inventory Management System.

## Included endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create a STAFF account |
| POST | `/api/auth/login` | Public | Validate credentials and return JWT |
| GET | `/api/auth/me` | JWT required | Return current user profile |

Signup intentionally does not accept a role. New public registrations always receive `STAFF`; provision ADMIN accounts through a controlled admin process.

## 1. Requirements

- JDK 21
- MySQL 8.x (or a compatible MySQL server)
- Maven 3.9+ or IntelliJ IDEA with Maven support
- Postman (for API testing)

## 2. Create the database

Run in MySQL Workbench:

```sql
CREATE DATABASE inventory_management_db;
```

Hibernate creates/updates the `users` table on startup (`ddl-auto=update`, suitable for development). For production, use schema migrations such as Flyway and set `ddl-auto=validate`.

## 3. Configure database credentials

Edit `src/main/resources/application.properties`, or set environment variables:

Windows PowerShell (current terminal only):
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/inventory_management_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
```

Do not commit real credentials to Git. The default `change_me` will only work if that is genuinely your local MySQL password.

## 4. Configure JWT secret

The project has a development-only fallback secret so it can be started locally. Replace it before sharing/deployment. `JWT_SECRET` must be Base64-encoded and decode to at least 32 bytes.

Generate one with PowerShell:
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$secret = [Convert]::ToBase64String($bytes)
$env:JWT_SECRET = $secret
```

Token lifetime defaults to 15 minutes. Override with `JWT_EXPIRATION_MS` if needed.

## 5. Run the API

From the folder containing `pom.xml`:

```powershell
mvn spring-boot:run
```

Or open the folder in IntelliJ IDEA, wait for Maven import, then run `InventoryAuthApiApplication`.

Base URL: `http://localhost:8080`

## 6. Test in Postman

### A. Signup

- Method: `POST`
- URL: `http://localhost:8080/api/auth/signup`
- Header: `Content-Type: application/json`
- Body → raw → JSON:

```json
{
  "fullName": "Rohit Patil",
  "email": "rohit@example.com",
  "password": "StrongPassword123"
}
```

Expected status: `201 Created`. Response includes the user's id, name, email, role and creation time. It never returns the password/hash.

### B. Login

- Method: `POST`
- URL: `http://localhost:8080/api/auth/login`
- Header: `Content-Type: application/json`
- Body → raw → JSON:

```json
{
  "email": "rohit@example.com",
  "password": "StrongPassword123"
}
```

Expected status: `200 OK`. Copy `accessToken` from the response.

### C. Call a protected endpoint

- Method: `GET`
- URL: `http://localhost:8080/api/auth/me`
- Authorization tab → Bearer Token → paste the token

Expected status: `200 OK` with the signed-in user's profile. Without a token or with an invalid/expired token, the request is rejected.

### D. Negative tests

- Signup with an existing email → `409 Conflict`.
- Signup with an invalid email / short password → `400 Bad Request`.
- Login with a wrong password → `401 Unauthorized`.
- GET `/api/auth/me` without a token → `401 Unauthorized`.

## 7. React integration example

Use the following from your React project. Do not put passwords or JWT secrets in source control.

```javascript
const API = "http://localhost:8080/api/auth";

export async function signup({ fullName, email, password }) {
  const response = await fetch(`${API}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Signup failed");
  return data;
}

export async function login({ email, password }) {
  const response = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data; // data.accessToken, data.user
}

export async function getMyProfile(accessToken) {
  const response = await fetch(`${API}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Profile request failed");
  return data;
}
```

For a quick local demo, a frontend can hold the token in memory. Avoid long-lived tokens in `localStorage` for production because XSS can expose them. A stronger production setup often uses short-lived access tokens plus refresh tokens in Secure, HttpOnly cookies, with appropriate CSRF protections.

## 8. Common errors

- **Access denied / DB connection:** Check MySQL is running and DB username/password are correct.
- **Unknown database:** Run `CREATE DATABASE inventory_management_db;`.
- **Port 8080 in use:** Stop the other process or change `server.port`.
- **401 after login:** Ensure the full token is pasted into the Bearer Token field, and that the backend uses the same `JWT_SECRET` since the token was issued.
- **CORS error:** Run React on `http://localhost:5173` or `http://localhost:3000`, or update `CORS_ALLOWED_ORIGINS`.

## Security notes

- Passwords are hashed using BCrypt.
- JWTs are signed and expire after 15 minutes by default.
- Public signup always assigns `STAFF`; it does not trust a client-provided role.
- This sample uses stateless JWT access tokens. A logout endpoint cannot revoke an already-issued token by itself; for this starter, clear the token client-side. If server-side logout/revocation is required, add refresh-token storage/revocation or a token denylist.
- For production, use HTTPS, secret management, rate limiting, audit logging, database migrations, and tests.
