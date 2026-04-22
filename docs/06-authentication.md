# Authentication

The Xsolla Login API provides user authentication, registration, and session management.

**Base URL**: `https://login.xsolla.com/api`

## Token Types

### User JWT

Obtained after user authentication. Contains:

| Claim | Type | Description |
|-------|------|-------------|
| `exp` | Unix timestamp | Expiration (default: 24 hours) |
| `sub` | UUID | User ID on Xsolla |
| `email` | string | User's email |
| `username` | string | Display name |
| `type` | string | Auth method (xsolla_login, social, email) |
| `groups` | array | User group memberships |

Used in requests as:
```
Authorization: Bearer <user_JWT>
```

### Server JWT

For server-to-server operations. Obtained via OAuth 2.0 client credentials flow.

Used in requests as:
```
X-SERVER-AUTHORIZATION: <server_JWT>
```

## OAuth 2.0 Setup

### Create OAuth Client

1. Go to Publisher Account → Login project → Security → OAuth 2.0
2. Click "Add OAuth 2.0 Client"
3. For server-to-server: Check "Server (server-to-server connection)"
4. Set token lifetime
5. Save the `client_id` and `client_secret`

### Generate Server Token

```http
POST /oauth2/token HTTP/1.1
Host: login.xsolla.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>
```

Response:
```json
{
  "access_token": "<server_JWT>",
  "token_type": "bearer",
  "expires_in": 3600
}
```

## User Authentication Flows

### Email/Password Registration

```http
POST /api/user HTTP/1.1
Host: login.xsolla.com
Content-Type: application/json

{
  "username": "player123",
  "password": "SecurePass123!",
  "email": "player@example.com"
}
```

### Email/Password Login (JWT)

```http
POST /api/login HTTP/1.1
Host: login.xsolla.com
Content-Type: application/json

{
  "username": "player@example.com",
  "password": "SecurePass123!"
}
```

Response redirects to callback URL with token in query parameter.

### Email/Password Login (OAuth 2.0)

```http
POST /api/oauth2/login HTTP/1.1
Host: login.xsolla.com
Content-Type: application/json

{
  "username": "player@example.com",
  "password": "SecurePass123!"
}
```

Then exchange the `code` parameter for tokens:

```http
POST /api/oauth2/token HTTP/1.1
Host: login.xsolla.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=<code>&client_id=<client_id>&redirect_uri=<redirect_uri>
```

### Social Login

Redirect user to:
```
https://login.xsolla.com/api/social/{provider}/login_url?projectId=<login_project_id>&login_url=<callback_url>
```

Supported providers: `google`, `facebook`, `twitter`, `steam`, `discord`, `twitch`, `apple`, etc.

### Passwordless (Email)

Request code:
```http
POST /api/passwordless/email/code HTTP/1.1
Host: login.xsolla.com
Content-Type: application/json

{
  "email": "player@example.com"
}
```

Confirm with code:
```http
POST /api/passwordless/email/confirm HTTP/1.1
Host: login.xsolla.com
Content-Type: application/json

{
  "email": "player@example.com",
  "code": "123456"
}
```

## Token Refresh

```http
POST /api/oauth2/token HTTP/1.1
Host: login.xsolla.com
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=<refresh_token>&client_id=<client_id>
```

## Token Validation

### Validate User JWT

```http
POST /api/token/validate HTTP/1.1
Host: login.xsolla.com
Content-Type: application/json

{
  "token": "<user_JWT>"
}
```

### Validate Server JWT

```http
POST /api/server/token/validate HTTP/1.1
Host: login.xsolla.com
Content-Type: application/json

{
  "token": "<server_JWT>"
}
```

## User Profile

### Get Current User

```http
GET /api/users/me HTTP/1.1
Host: login.xsolla.com
Authorization: Bearer <user_JWT>
```

### Update Profile

```http
PATCH /api/users/me HTTP/1.1
Host: login.xsolla.com
Authorization: Bearer <user_JWT>
Content-Type: application/json

{
  "nickname": "NewNickname",
  "birthday": "1990-01-15"
}
```

## Password Reset

### Request Reset

```http
POST /api/password/reset/request HTTP/1.1
Host: login.xsolla.com
Content-Type: application/json

{
  "username": "player@example.com"
}
```

### Confirm Reset

```http
POST /api/password/reset/confirm HTTP/1.1
Host: login.xsolla.com
Content-Type: application/json

{
  "reset_code": "<code_from_email>",
  "new_password": "NewSecurePass123!"
}
```

## User Attributes

Store custom data on user profiles:

### Get Attributes

```http
POST /api/attributes/users/me/get HTTP/1.1
Host: login.xsolla.com
Authorization: Bearer <user_JWT>
Content-Type: application/json

{
  "keys": ["level", "experience"],
  "publisher_project_id": <project_id>
}
```

### Update Attributes

```http
POST /api/attributes/users/me/update HTTP/1.1
Host: login.xsolla.com
Authorization: Bearer <user_JWT>
Content-Type: application/json

{
  "attributes": [
    {"key": "level", "value": "42"},
    {"key": "experience", "value": "15000"}
  ],
  "publisher_project_id": <project_id>
}
```

## Rate Limits

- Client-side methods have stricter limits (brute-force protection)
- Server-side limits are higher
- HTTP 429 returned when exceeded
- Contact Xsolla for limit adjustments

## Xsolla Login IP Addresses

Whitelist these IPs if needed:
```
34.94.0.85, 34.94.14.95, 34.94.25.33, 34.94.115.185, 
34.94.154.26, 34.94.173.132, 34.102.48.30, 35.235.99.248, 
35.236.32.131, 35.236.35.100, 35.236.117.164
```
