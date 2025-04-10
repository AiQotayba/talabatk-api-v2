# Talabatk API

A food ordering platform API built with Express.js and MongoDB.

## Project Overview

Talabatk is a food ordering platform API that provides endpoints for managing users, categories, products, orders, cart, and delivery addresses. It implements a comprehensive authentication and authorization system using JWT tokens.

## Technology Stack

- **Language**: TypeScript (Node.js runtime)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **API Style**: RESTful

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- MongoDB

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/talabatk-api.git
   cd talabatk-api
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file based on `.env.example`:
   \`\`\`bash
   cp src/.env.example .env
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Project Structure

\`\`\`
📦 talabatk-backend/
├── 📁 src/
│   ├── 📁 routes/             # Route definitions
│   ├── 📁 controllers/        # Request/response handlers
│   ├── 📁 models/             # Mongoose schemas
│   ├── 📁 middlewares/        # Auth, validation, error handling, etc.
│   ├── 📁 utils/              # Helper utilities like JWT, hash, etc.
│   ├── 📁 config/             # Database and environment config
│   ├── 📁 validations/        # Express-validator files
│   ├── 📁 jobs/               # Scheduled tasks
│   ├── 📁 docs/               # Swagger/OpenAPI documentation
│   ├── 📄 app.ts             # App entry point and configuration
│   └── 📄 server.ts          # Server startup
├── 📄 .env                   # Environment variables
├── 📄 .gitignore
├── 📄 tsconfig.json
├── 📄 package.json
└── 📄 README.md
\`\`\`

## Available Endpoints

See the API documentation at `/api-docs` for a complete list of endpoints.

## License

This project is licensed under the MIT License.

## note
{
  "name": "string",
  "email": "ktsyr2@gmail.com",
  "phone": 1234567894,
  "password": "password"
}