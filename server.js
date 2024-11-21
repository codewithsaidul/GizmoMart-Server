const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 4000;

// Middleware configuration
app.use(cors());
app.use(express.json());

// JWT configuration

// MongoDB configuration
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lggjuua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Databes Connection
const dbConnect = async () => {
  try {
    client.connect();

    // ============================= Product Related API =============================

    // ============================== User Related API ===============================

    console.log("Connected to MongoDB!");
  } catch (error) {
    console.log(error);
  }
};
dbConnect().catch(console.dir);

app.get("/", (req, res) => {
  res.send("GizmoMart Server Running!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
