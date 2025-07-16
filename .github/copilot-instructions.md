<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Master Product List - Copilot Instructions

This is a Node.js application for managing a centralized product catalog that can be synchronized across multiple stores using the yojin.co.uk SaaS platform API.

## Project Structure
- `src/` - Main application source code
  - `config/` - Configuration files
  - `models/` - Database models and schemas
  - `services/` - Business logic and API integrations
  - `routes/` - Express.js API routes
  - `utils/` - Utility functions
- `public/` - Static web dashboard files
- `data/` - Database and file storage

## Key Features
1. **Master Product Management** - Centralized product catalog with CRUD operations
2. **Merchant Management** - Store/merchant configuration and API key management
3. **Bulk Synchronization** - Efficient batch processing for syncing products to multiple stores
4. **CSV Import/Export** - Bulk data operations via CSV files
5. **Sync Job Tracking** - Monitor and track synchronization progress
6. **Web Dashboard** - User-friendly interface for managing products and merchants

## API Integration
- Uses axios for HTTP requests to yojin.co.uk API
- Implements retry logic and rate limiting
- Handles authentication and error responses
- Supports bulk operations for efficiency

## Database
- Uses SQLite for local data storage
- Stores master products, merchants, sync status, and job history
- Implements proper indexing for performance

## Best Practices
- Use async/await for asynchronous operations
- Implement proper error handling and logging
- Follow RESTful API design principles
- Use batch processing for bulk operations
- Implement proper validation for all inputs

## Environment Variables
- Copy `.env.example` to `.env` and configure:
  - YOJIN_API_KEY - Your yojin.co.uk API key
  - YOJIN_API_SECRET - Your yojin.co.uk API secret
  - Other configuration options as needed

## Development Commands
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- Use the web dashboard at http://localhost:3000 for easy management
