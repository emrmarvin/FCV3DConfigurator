"use server"
import fs  from "fs"
import sqlite3 from "sqlite3";

export const createToken = async () => {
    let returndata = {
        token: "req.data.access_token",
        edocs_url: process.env.EDOCS_URL,
        acc_url: process.env.ACC_URL
    }
    return returndata;
};
export const retrieveFields = async()=>{
    let db_path = process.env.SQLITE_PATH;
    const db = new sqlite3.Database(db_path, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });
    // Query the database
    const query = 'SELECT y.Name as model_name ,x.Name as field_name,x.Value,x.Drawing_Name as value FROM Fields x INNER JOIN Models y on x.Model_ID = y.ID order by Drawing_Name';
    let return_rows = new Promise((resolve,reject)=>{
            db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error executing query:', err.message);
                reject(err.message)
            }
            resolve(rows)
        })
    })
    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing the database connection:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
    return return_rows
}