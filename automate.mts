const sqlite3 = require('sqlite3').verbose();
const fs = require('fs')
const dbFilePath = './tempfiles/database.db'
function setupDatabase() {
    // Open a database connection (or create the database file if it doesn't exist)
    if (!fs.existsSync(dbFilePath)) {
        fs.writeFileSync(dbFilePath, '');
        console.log('Database file created: database.db');
    } else {
        console.log('Database file already exists.');
    }
    const db = new sqlite3.Database(dbFilePath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    const createModelsTable = `
        CREATE TABLE IF NOT EXISTS Models (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name VARCHAR(100) UNIQUE
        );
    `;

    const createFieldsTable = `
        CREATE TABLE IF NOT EXISTS Fields (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Model_ID INTEGER NOT NULL,
            Name VARCHAR(100) NOT NULL,
            Value VARCHAR(100),
            Drawing_Name VARCHAR(100),
            FOREIGN KEY (Model_ID) REFERENCES Models(ID),
            Unique(Model_ID,Name,Value,Drawing_Name)
        );
    `;

    db.serialize(() => {
        db.run(createModelsTable, (err) => {
            if (err) {
                console.error('Error creating Models table:', err.message);
            } else {
                console.log('Models table created (or already exists).');
            }
        });

        db.run(createFieldsTable, (err) => {
            if (err) {
                console.error('Error creating Fields table:', err.message);
            } else {
                console.log('Fields table created (or already exists).');
            }
        });
        let model_list = ["Easy-E","GX","V-Ball"]
        const stmt = db.prepare("INSERT INTO Models(Name) VALUES (?)");
        for (let i = 0; i < model_list.length; i++) {
            try{
                stmt.run(model_list[i])
            }catch(ex){
                console.log(model_list[i],"exists")
            }
        }
        stmt.finalize();
    });

    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
}

function populate(){
    const db = new sqlite3.Database(dbFilePath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });
    let list = fs.readFileSync('./public/easy_e.csv').toString().split('\r\n');
    let headers = list[0].split(',');
    for(let i=1;i<list.length;i++){
        let columns = list[i].split(',')
        if(columns.length != 6){
            console.log("cont")
            continue;
        }
        let stmt = db.prepare("INSERT INTO Fields(Model_ID,Name,Value,Drawing_Name) VALUES (?,?,?,?)");
        for(let x=0;x<headers.length - 1;x++){
            if(headers[x] == 'Name'){continue;}
            stmt.run(1,headers[x],columns[x],columns[columns.length - 1]);
        }
        stmt.finalize();
    }
}

// setupDatabase();
populate();