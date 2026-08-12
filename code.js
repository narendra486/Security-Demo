const express = require("express");
const path = require("path");
const { execFile } = require("child_process");

const app = express();

app.use(express.json());

// Secrets must come from environment variables
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS_SECRET_ACCESS_KEY is required");
}

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}


// 1. SQL Injection - Secure
app.get("/users", (req, res) => {
  const username = req.query.username;

  const query = "SELECT * FROM users WHERE username = ?";

  db.query(query, [username], (err, result) => {
    if (err) {
      return res.status(500).send("Database error");
    }

    res.json(result);
  });
});


// 2. Command Injection - Secure
app.get("/ping", (req, res) => {
  const host = req.query.host;

  // Only allow hostname/IP characters
  if (!host || !/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).send("Invalid host");
  }

  // execFile does not invoke a shell
  execFile("ping", ["-c", "4", host], (error, stdout) => {
    if (error) {
      return res.status(500).send("Ping failed");
    }

    res.send(stdout);
  });
});


// 3. Path Traversal - Secure
app.get("/file", (req, res) => {
  const fileName = req.query.name;

  const baseDir = path.resolve("/var/app/files");
  const filePath = path.resolve(baseDir, fileName);

  // File must remain inside /var/app/files
  if (!filePath.startsWith(baseDir + path.sep)) {
    return res.status(400).send("Invalid file");
  }

  res.sendFile(filePath);
});


// 4. Hardcoded Secret - Secure
// Secret is loaded from environment variable
// process.env.AWS_SECRET_ACCESS_KEY


// 5. Weak JWT Secret - Secure
// Strong secret is loaded from environment variable
// process.env.JWT_SECRET


// 6. eval() - Secure
app.post("/calculate", (req, res) => {
  const expression = req.body.expression;

  // Do not use eval() with user input.
  // Only accept a simple numeric value in this example.
  const number = Number(expression);

  if (!Number.isFinite(number)) {
    return res.status(400).send("Invalid input");
  }

  res.json({ result: number });
});


// 7. Authentication + Authorization + SQL Injection - Secure
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;

  // Authentication
  if (!req.user) {
    return res.status(401).send("Authentication required");
  }

  // Authorization
  if (!req.user.isAdmin) {
    return res.status(403).send("Access denied");
  }

  const query = "DELETE FROM users WHERE id = ?";

  db.query(query, [userId], (err) => {
    if (err) {
      return res.status(500).send("Database error");
    }

    res.send("User deleted");
  });
});


// 8. SSRF - Secure
app.get("/fetch", async (req, res) => {
  const url = req.query.url;

  try {
    const parsedUrl = new URL(url);

    // Only HTTPS
    if (parsedUrl.protocol !== "https:") {
      return res.status(400).send("Only HTTPS is allowed");
    }

    // Allow only trusted domains
    const allowedHosts = [
      "api.example.com"
    ];

    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return res.status(403).send("Host not allowed");
    }

    const response = await fetch(parsedUrl.href);

    if (!response.ok) {
      return res.status(502).send("Request failed");
    }

    const data = await response.text();

    res.send(data);

  } catch (error) {
    res.status(400).send("Invalid URL");
  }
});


// 9. Sensitive Information in Logs - Secure
app.post("/login", (req, res) => {
  const { username } = req.body;

  // Never log password, token, API key, etc.
  console.log("Login request:", {
    username
  });

  res.send("Login processed");
});


// 10. Insecure HTTP - Secure
app.get("/price", async (req, res) => {
  const response = await fetch(
    "https://example.com/price"
  );

  if (!response.ok) {
    return res.status(502).send("Price service unavailable");
  }

  const data = await response.text();

  res.send(data);
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});

