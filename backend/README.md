# SiGEMed Backend

This directory contains the Node.js and Express backend server for the SiGEMed application. It handles user authentication and will be expanded to manage all database interactions.

## Prerequisites

- Node.js (v18 or higher recommended)
- A running MySQL/MariaDB database server
- The database schema and demo data from the SiGEMed "Ayuda y FAQ" page loaded into your database.

## Setup Instructions

1.  **Install Dependencies:**
    Navigate to this `backend` directory in your terminal and run:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    - Create a file named `.env` in this `backend` directory.
    - Copy the contents from `.env.example` into your new `.env` file.
    - Fill in the values for your MySQL database connection:
      ```
      DB_HOST=localhost
      DB_USER=your_database_user
      DB_PASSWORD=your_database_password
      DB_NAME=your_database_name
      PORT=4000
      ```
    - Replace `your_database_user`, `your_database_password`, and `your_database_name` with the credentials you created in Hostinger or your local environment.

3.  **Run the Server:**
    - For development (with automatic reloading on file changes):
      ```bash
      npm run dev
      ```
    - For production:
      ```bash
      npm start
      ```

The server should now be running on `http://localhost:4000`.
