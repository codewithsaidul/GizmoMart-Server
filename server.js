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

    // ============================= Database Collection =============================
    const userCollection = client.db("GizmoMart").collection("users");




    // ============================= Product Related API =============================

    // ============================== User Related API ===============================

    // Add a new user to the database
    app.post("/users", async (req, res) => {
      const user = req.body;

      // Check if user already exists
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.status(400).send({ message: "User already exists!" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });



    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ message: "User not found!" });
      }
      res.send(user);
    });

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
