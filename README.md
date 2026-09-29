## Related repository

This is the backend for **Manage My Shifts**. The Angular client
that consumes this API lives at:
[LuizGustavoGuimaraes02/manage-my-shifts-client](https://github.com/LuizGustavoGuimaraes02/manage-my-shifts-client)

Project tracking (issues, board) for both repositories is centralized here.

# Manage My Shifts — API

A REST API for the Manage My Shifts app, built with Node.js, Express and MongoDB (via Mongoose), with JWT-based authentication. Handles user accounts, work shifts, comments, and permission levels.

## Related repository

This is the backend for **Manage My Shifts**. The Angular client that consumes this API lives at:
[LuizGustavoGuimaraes02/manage-my-shifts-client](https://github.com/LuizGustavoGuimaraes02/manage-my-shifts-client)

Project tracking (issues, board) for both repositories is centralized here.

## Technologies used

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens (`jsonwebtoken`) for authentication
- `bcryptjs` for password hashing
- `dotenv` for environment configuration
- `nodemon` for local development (auto-restart on file changes)

## Running it locally

1. Clone the repository and install dependencies:
   ```
   git clone https://github.com/LuizGustavoGuimaraes02/manage-my-shifts-api.git
   cd manage-my-shifts-api
   npm install
   ```

2. Create a `.env` file in the project root with the following variables (see table below for what each one means — do not commit this file):
   ```
   MONGO_URI=
   JWT_SECRET=
   PORT=3000
   ```

3. Start the server:
   ```
   npm run dev
   ```
   (or `node index.js` if you don't have `nodemon` set up)

4. The API is available at `http://localhost:3000`. A GET request to `/` confirms it's running.

### Environment variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string, including the database name (e.g. a MongoDB Atlas connection string ending in `/manage-my-shifts?...`). Each project should use its own dedicated database — sharing one with an unrelated project causes collection name collisions. |
| `JWT_SECRET` | A long, unpredictable string used to sign and verify JWTs. Never share this value or commit it. |
| `PORT` | The port the server listens on. Defaults to `3000` if not set. |

## Authentication

Login (`POST /api/user/login`) returns a JWT valid for 1 hour. Protected routes require it in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token payload contains the user's `id` and `permission` level (`admin` or `regular_user`). Routes marked "Admin only" below require the authenticated user to have `admin` permission — there is no endpoint to grant admin access; it's set directly in the database.

## Routes

All routes are prefixed with `/api`. Every route except registration and login requires a valid `Authorization` header.

### User

| Method | Route | Body | Access | Description |
|---|---|---|---|---|
| POST | `/user/` | `{ email, password, firstName, lastName }` | Public | Register a new account. |
| POST | `/user/login` | `{ email, password }` | Public | Log in, returns `{ token }`. |
| GET | `/user/me` | — | Authenticated | Returns the decoded token payload for the current user. |

### Shifts

| Method | Route | Body | Access | Description |
|---|---|---|---|---|
| POST | `/shifts/` | `{ start, end, perHour, place }` | Authenticated | Create a shift owned by the current user. |
| GET | `/shifts/` | — | Admin only | List every shift, with owner details populated. |
| GET | `/shifts/:id` | — | Owner or admin | Get a single shift. |
| PATCH | `/shifts/:id` | Any subset of `{ start, end, perHour, place }` | Owner or admin | Update a shift. |
| DELETE | `/shifts/:id` | — | Admin only | Delete a shift. |

### Comments

| Method | Route | Body | Access | Description |
|---|---|---|---|---|
| POST | `/comment` | `{ description }` | Authenticated | Create a comment authored by the current user. |
| GET | `/comment` | — | Admin only | List every comment, with author details populated. |
| GET | `/comment/:id` | — | Authenticated | Get a single comment. |
| GET | `/comment/user/:userId` | — | Authenticated | List a specific user's comments. |
| PATCH | `/comment/:id` | `{ description }` | Owner or admin | Update a comment. |
| DELETE | `/comment/:id` | — | Admin only | Delete a comment. |

### Permissions

| Method | Route | Body | Access | Description |
|---|---|---|---|---|
| GET | `/permission` | — | Authenticated | List the seeded permission levels. New permissions are added manually in the database — there is no create endpoint, per the assignment spec. |

## Data model

- **User**: email (unique), hashed password, first/last name, permission (`admin` | `regular_user`, defaults to `regular_user`), timestamps.
- **Shift**: owning user's id, start/end (as dates), hourly rate, workplace, timestamps.
- **Comment**: authoring user's id, description, timestamps.
- **Permission**: description (`admin` or `regular_user`).

## Known limitations

- JWTs are stateless — there is no logout/token invalidation endpoint. A token remains valid until it expires (1 hour), even if the user's permission changes in the meantime (a new login is required to pick up a permission change).
- No endpoint exists to promote a user to admin; it's done by editing the `permission` field directly in the database.
- No automated test suite — all endpoints were manually verified via Postman during development, covering both success and expected-failure cases (invalid input, missing auth, wrong permission level) for every route listed above.

## Author

Luiz Gustavo Guimaraes — built as a course project full-stack sequence, at Greystone College.
