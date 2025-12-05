// 

const express = require('express');
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
// Initialize Express app
const app = express();
const PORT = 3000;
const storage = multer.memoryStorage(); // Store images in memory for BLOB upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Increase the JSON payload size limit 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb'}));

// Configure SQLite database
const db = new sqlite3.Database("./database.sqlite", (err) => {
    if (err) {
        console.error("Error connecting to SQLite:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create tables if they don't exist
db.run(`
    CREATE TABLE IF NOT EXISTS rescue_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        location TEXT,
        description TEXT,
        image BLOB,
        video_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

//Configure Multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadDir = path.join(__dirname, "uploads");
//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir);
//         }
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });


// API endpoint: Submit rescue request
app.post('/rescue', upload.single('animal-image'),async (req, res) => {
    try {
        const { name, email, location, description } = req.body;
        const imageBuffer = req.file ? req.file.buffer : null;  // Get the image as a buffer
        console.log('Image Buffer:', imageBuffer);
        if (!name || !email || !location || !description) {
            throw new Error('Missing required fields');
        }

        // Insert the rescue request into the database
        const sql = `INSERT INTO rescue_requests (name, email, location, description, image)
                    VALUES (?, ?, ?, ?, ?)`;
        // Insert data into the database
        db.run(sql, [name, email, location, description, imageBuffer], function (err) {
            if (err) {
                return res.status(500).send('Error inserting data into the database');
            }
            // Send back the ID of the newly inserted record
            res.json({ id: this.lastID });
           // res.status(200).send('Rescue request submitted successfully!');
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('An error occurred while processing the request.');
    }
});
app.use('/uploads', express.static('uploads'));

app.get('/rescue-requests', async (req, res) => {
    try {
        const sql = 'SELECT * FROM rescue_requests';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).send('Error fetching data from the database');
            }
           // console.log('Fetched rows:', rows); // Add this log
            const requests = rows.map(row => ({
                id: row.id,
                name: row.name,
                email: row.email,
                location: row.location,
                description: row.description,
                image: row.image ? row.image.toString('base64') : null // Convert image buffer to base64
            }));
            res.json(requests);
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('An error occurred while processing the request.');
    }
});


// API endpoint: Delete rescue request (optional)
app.delete("/api/rescue/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM rescue_requests WHERE id = ?", [id], function (err) {
        if (err) {
            console.error("Error deleting from database:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Rescue request deleted successfully" });
    });
});

// Chatbot API Endpoint
app.post("/chatbot", async (req, res) => {
    const { message } = req.body;

    // Example: Predefined responses (You can integrate GPT models here)
    const responses = {
        "hi":"please ask your query",
        "What should I do if I see an injured animal?": "You should report it to your local animal rescue center or contact us via the form.",
        "What are the common signs of an animal in distress?": "Animals in distress often exhibit unusual behavior such as limping, excessive vocalization, or visible wounds.",
    };

    const defaultResponse = "I'm sorry, I don't have an answer to that. Please contact us for further assistance.";

    // Send a response based on the user's question
    const reply = responses[message] || defaultResponse;

    res.json({ reply });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
