# CodeClimbers Platform Service

This project provides a service for performing online required activities to CodeClimbers users.

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install Deno if you haven't already:
   ```
   curl -fsSL https://deno.land/x/install/install.sh | sh
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   LOOPS_API_KEY=your_loops_api_key
   REDIS_URL=redis://localhost:6379
   ```

4. Start Redis:
   ```
   docker-compose up -d redis
   ```

5. Run the development server:
   ```
   deno task dev
   ```

The server will start on `http://localhost:8000`.

## Project Intention

This microservice is designed to extend the functionality of CodeClimbers by providing features that require an internet connection. Currently, it:

1. Sends weekly report emails to users summarizing their progress and achievements.
2. Integrates with external services like Loops for transactional emails.
3. Uses Redis for data persistence and to prevent duplicate emails.

By offloading these internet-dependent tasks to a separate service, the main CodeClimbers application can maintain its offline-first approach while still offering enhanced online features when available.

In the future, this service may handle things like multi-device support or integrating with online data sources like Github, Linear, etc...