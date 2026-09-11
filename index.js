const express = require("express");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data-store.json");

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    return {};
  }
}

function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store), "utf8");
}

const app = express();

app.use(express.json({ limit: "8mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/storage/:key", (req, res) => {
  try {
    const store = readStore();
    const value = store[req.params.key];
    if (value === undefined) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ key: req.params.key, value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "storage_error" });
  }
});

app.post("/api/storage/:key", (req, res) => {
  try {
    const store = readStore();
    store[req.params.key] = req.body.value;
    writeStore(store);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "storage_error" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
