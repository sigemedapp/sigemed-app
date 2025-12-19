import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuration object for the database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Log configuration for debugging (excluding the password)
console.log('Attempting to connect with the following configuration:');
console.log(`- Host: ${dbConfig.host}`);
console.log(`- Database: ${dbConfig.database}`);
console.log(`- User: ${dbConfig.user}`);
console.log(`- Port: ${dbConfig.port}`);


// Create a connection pool to the database
const pool = mysql.createPool(dbConfig);

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database.');
    connection.release();
  } catch (error) {
    // Log the DETAILED error message for better debugging
    console.error('--- DATABASE CONNECTION FAILED ---');
    console.error('An error occurred while connecting to the database. Please check the details below.');
    console.error('Error Details:', error); // This will print the full error object, including code, errno, etc.
    console.error('---------------------------------');

    // Exit the process if we can't connect to the database, as the app cannot run without it.
    process.exit(1);
  }
})();

// Export the pool to be used in other files
export default pool;