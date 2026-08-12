const express = require("express");
const { exec } = require("child_process");

const app = express();

app.use(express.json());

// 1. SQL Injection
app.get("/users", async (req, res) => {
  const username = req.query.username;

  const query = `SELECT * FROM users WHERE username = '${username}'`;

  db.query(query, (err, result) => {
    if (err) return res.status(500).send("Database error");
    res.json(result);
  });
});

// 2. Command Injection
app.get("/ping", (req, res) => {
  const host = req.query.host;

  exec(`ping -c 4 ${host}`, (error, stdout) => {
    if (error) return res.status(500).send("Ping failed");
    res.send(stdout);
  });
});

// 3. Path Traversal
app.get("/file", (req, res) => {
  const file = req.query.name;

  res.sendFile("/var/app/files/" + file);
});

// 4. Hardcoded Secret
const AWS_SECRET_ACCESS_KEY = "AKIA_TEST_SECRET_123456";

// 5. Weak JWT Secret
const JWT_SECRET = "secret";

// 6. Unsafe eval
app.post("/calculate", (req, res) => {
  const expression = req.body.expression;

  const result = eval(expression);

  res.json({ result });
});

// 7. Missing authentication / authorization
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;

  db.query(`DELETE FROM users WHERE id = ${userId}`, () => {
    res.send("User deleted");
  });
});

// 8. SSRF
app.get("/fetch", async (req, res) => {
  const url = req.query.url;

  const response = await fetch(url);
  const data = await response.text();

  res.send(data);
});

// 9. Sensitive information in logs
app.post("/login", (req, res) => {
  console.log("Login request:", req.body);

  res.send("Login processed");
});

// 10. Insecure HTTP request
app.get("/price", async (req, res) => {
  const response = await fetch("http://example.com/price");
  const data = await response.text();

  res.send(data);
});

app.listen(3000);
