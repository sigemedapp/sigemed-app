
import db from './db.js';

const updateSchema = async () => {
    try {
        console.log('Starting schema update...');
        // Change status column to VARCHAR to allow any status
        const query = "ALTER TABLE equipment MODIFY COLUMN status VARCHAR(100) DEFAULT 'Operativo'";
        console.log('Executing:', query);

        await db.query(query);

        console.log('Schema updated successfully! Status column is now VARCHAR(100).');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
};

updateSchema();
