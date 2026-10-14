# Manage My Shifts - API

REST API for the **Manage My Shifts** app, built with Node.js, Express and MongoDB (Mongoose), with JWT authentication. It handles user accounts, work shifts, comments and permission levels.

The Angular client that consumes this API is here: [LuizGustavoGuimaraes02/manage-my-shifts-client](https://github.com/LuizGustavoGuimaraes02/manage-my-shifts-client). Project tracking (issues and board) for both repositories is centralized in this repository.

## Technologies

- Node.js and Express
- MongoDB with Mongoose
- JSON Web Tokens (`jsonwebtoken`) and `bcryptjs` for password hashing
- `dotenv` for configuration, `cors` for the client origin
- `nodemon` for local development

## Quick start (for reviewers)

1. Install dependencies:

   ```bash
   git clone https://github.com/LuizGustavoGuimaraes02/manage-my-shifts-api.git
   cd manage-my-shifts-api
   npm install
   ```

2. Create a `.env` file in the project root. You can copy `.env.example` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   (On Windows PowerShell: `Copy-Item .env.example .env`)

3. Start the server:

   ```bash
   npm start
   ```

   For development with automatic restarts use `npm run dev`.

4. The API runs at `http://localhost:3000`. A `GET /` request confirms it is running.
5. Create the permission levels and an administrator account (see **First-time database setup** below).
6. Start the Angular client (see its README) and open `http://localhost:4200`.

### Environment variables

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string including the database name. A local MongoDB works, for example `mongodb://127.0.0.1:27017/manage-my-shifts`, and so does a MongoDB Atlas connection string ending in `/manage-my-shifts?...` (allow your IP in Atlas network access). |
| `JWT_SECRET` | A long, unpredictable string used to sign and verify tokens. Never share it or commit it. |
| `PORT` | Port of the server. Defaults to `3000`. |

The `.env` file is ignored by Git. The client expects the API at `http://localhost:3000/api`, and the API only accepts browser requests from `http://localhost:4200` (CORS).

## First-time database setup

Two things are done by hand, as the specification says ("addPermission: only by hands", and there is no endpoint to grant admin access). With `mongosh`, or the Atlas "Browse Collections" screen:

```js
use manage-my-shifts

// 1. Permission levels
db.permissions.insertMany([{ description: "admin" }, { description: "regular_user" }])

// 2. Register a user through the app or POST /api/user, then promote it
db.users.updateOne({ email: "admin@example.com" }, { $set: { permission: "admin" } })
```

The token carries the permission, so the promoted user must log in again to get an administrator token.

## Authentication

`POST /api/user/login` returns `{ token }`, a JWT valid for **1 hour**. Protected routes need it in the header:

```
Authorization: Bearer <token>
```

The payload contains the user `id` and `permission` (`admin` or `regular_user`).

## Routes

All routes are prefixed with `/api`.

### User

| Method | Route | Body | Access | Description |
| --- | --- | --- | --- | --- |
| POST | `/user/` | `{ email, password, firstName, lastName, birthDate }` | Public | Register a new account. |
| POST | `/user/login` | `{ email, password }` | Public | Log in, returns `{ token }`. |
| POST | `/user/reset-password` | `{ email, password }` | Public | Set a new password for a forgotten password. **Deletes all data of the account.** Refused for administrators. |
| GET | `/user/me` | none | Authenticated | Returns the decoded token payload. |
| GET | `/user/` | none | Admin only | List all users (without passwords). |
| GET | `/user/:id` | none | Self or admin | Get one user (without password). |
| PATCH | `/user/:id` | Any subset of `{ email, password, firstName, lastName, birthDate }` | Self or admin | Update a user. Sending a `password` **deletes all data of the account**. |
| DELETE | `/user/:id` | none | Admin only | Delete a user and all associated data. |

### Shifts

| Method | Route | Body | Access | Description |
| --- | --- | --- | --- | --- |
| POST | `/shifts/` | `{ name, start, end, perHour, place, comments? }` | Authenticated | Create a shift owned by the current user. `name` must be unique per user (409 otherwise). |
| GET | `/shifts/` | none | Admin only | List every shift, with the owner (`_id`, `email`, `firstName`, `lastName`) populated. |
| GET | `/shifts/my` | none | Authenticated | List the shifts of the current user. |
| GET | `/shifts/:id` | none | Owner or admin | Get a single shift. |
| PATCH | `/shifts/:id` | Any subset of `{ name, start, end, perHour, place, comments }` | Owner or admin | Update a shift. |
| DELETE | `/shifts/:id` | none | Admin only | Delete a shift. |

### Comments

| Method | Route | Body | Access | Description |
| --- | --- | --- | --- | --- |
| POST | `/comment` | `{ description }` | Authenticated | Create a comment authored by the current user. |
| GET | `/comment` | none | Admin only | List every comment, with the author populated. |
| GET | `/comment/:id` | none | Authenticated | Get a single comment. |
| GET | `/comment/user/:userId` | none | Authenticated | List the comments of a user. |
| PATCH | `/comment/:id` | `{ description }` | Owner or admin | Update a comment. |
| DELETE | `/comment/:id` | none | Admin only | Delete a comment. |

### Permissions

| Method | Route | Body | Access | Description |
| --- | --- | --- | --- | --- |
| GET | `/permission` | none | Authenticated | List the permission levels. There is no create endpoint, as the specification says. |

## Validation and business rules

- Email must be valid and unique (409 if already registered).
- Password: at least 6 characters. Names: at least 2 characters. Birth date: the age must be between 6 and 130.
- Hourly rate cannot be negative (400).
- **Changing or resetting a password deletes the account's shifts and comments**, as the client specification requires.
- Deleting a user deletes the user's shifts and comments too.
- The public reset endpoint refuses administrator accounts, so an administrator cannot be taken over through it.

## Data model

- **User**: email (unique), hashed password, first name, last name, birth date, permission (`admin` or `regular_user`, default `regular_user`), comments, timestamps.
- **Shift**: user id, name (unique per user), start, end, hourly rate, place, comments, timestamps.
- **Comment**: author user id, description, timestamps.
- **Permission**: description (`admin` or `regular_user`).

## Differences from the API specification

The client project needed a few things the API specification does not list, so they were added:

- `birthDate` on users (age validation on register and profile update).
- `name` (unique per user) and `comments` on shifts.
- `GET /shifts/my`, `GET /user/`, `GET /user/:id`, `PATCH /user/:id`, `DELETE /user/:id` and `POST /user/reset-password`.
- Field names use camelCase (`firstName`, `lastName`) and the password field is `password` instead of `pass`.

## Known limitations

- Tokens are stateless: there is no logout endpoint, and a token stays valid until it expires (1 hour), even if the permission of the user changes. A new login picks up the change.
- Password reset has no email verification, as the client specification describes it. Anyone who knows the email of a regular worker can reset that account password. The reset wipes the account data and is refused for administrators, which limits the damage but does not remove the risk.
- There is no automated test suite. Endpoints were verified manually with Postman, covering success and expected-failure cases.

## Author

Luiz Gustavo Guimaraes - course project of the full-stack sequence, Greystone College.
