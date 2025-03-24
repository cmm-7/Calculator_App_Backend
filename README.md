# Calculator App Backend

A secure and scalable backend service for the Calculator App, built with Node.js, Express, and PostgreSQL. This service handles user authentication, calculation storage, and two-factor authentication.

## Features

- 🔐 **Authentication System**

  - Firebase Authentication integration with ID tokens
  - Two-Factor Authentication (2FA) via email
  - Secure route protection with Firebase Admin SDK
  - Token expiration handling
  - Session management
  - Automatic token verification

- 💾 **Data Management**

  - PostgreSQL database integration
  - User data storage
  - Calculation history storage
  - Verification code management
  - Automatic data cleanup for expired codes
  - Cascading deletes for user data

- 📧 **Email Service**

  - SendGrid integration for 2FA emails
  - Email verification system
  - Secure code delivery
  - Rate limiting for email sending
  - Error handling for failed deliveries

- 🛡️ **Security Features**
  - Input validation
  - Rate limiting
  - Secure password handling
  - Protected API endpoints
  - CORS configuration
  - Request sanitization

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Firebase Admin SDK
- SendGrid
- pg-promise for database operations
- Jest for testing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Firebase Admin SDK credentials
- SendGrid API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=calculator_app_db
PG_USER=your_postgres_user
PG_PASSWORD=your_postgres_password

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd calculator-app-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   ```bash
   psql -U your_postgres_user -d calculator_app_db -f db/schema.sql
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Project Structure

```
calculator-app-backend/
├── controller/          # Route controllers
│   ├── authController.js    # Authentication routes
│   └── calculationsController.js  # Calculation routes
├── db/                 # Database configuration
│   ├── dbConfig.js     # Database connection setup
│   └── schema.sql      # Database schema
├── middleware/         # Custom middleware
│   └── firebase.js     # Firebase authentication
├── queries/           # Database queries
│   ├── authQueries.js      # User-related queries
│   └── calculationsQueries.js  # Calculation queries
├── services/          # Business logic
│   └── emailService.js     # Email service
├── tests/             # Test files
│   ├── auth.test.js        # Authentication tests
│   ├── calculations.test.js # Calculation tests
│   └── allRoutes.test.js   # Integration tests
├── server.js          # Application entry point
└── package.json       # Project dependencies
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/enable-2fa` - Enable 2FA
- `POST /auth/disable-2fa` - Disable 2FA
- `POST /auth/send-verification-code` - Send 2FA code
- `POST /auth/verify-2fa-code` - Verify 2FA code

### Calculations

- `GET /calculations` - Get user's calculation history
- `POST /calculations` - Save a new calculation
- `PUT /calculations/:id` - Update a calculation
- `DELETE /calculations/:id` - Delete a calculation

## Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT false
);

CREATE TABLE calculations (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  expression TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verification_codes (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Testing

Run the test suite:

```bash
npm test
```

The test suite includes:

- Authentication tests
- Calculation CRUD tests
- Integration tests
- Error handling tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
