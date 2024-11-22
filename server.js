const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const productCollection = client.db("GizmoMart").collection("products");

    

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

    // Get The All user Data
    app.get("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.find(user).toArray();
      res.send(result);
    });

    // Get Single User Data With Email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ message: "User not found!" });
      }
      res.send(user);
    });

    // Update a User Role & Status
    app.patch("/userUpdate/:id", async (req, res) => {
      const Id = req.params.id;
      const userId = parseInt(Id);
      const updateData = req.body;
      const role = updateData.role;
      const status = updateData.status;
      const updateDoc = {
        $set: {
          role,
          status,
        }
      }
      const query = { _id: new ObjectId(Id)}
      const result = await userCollection.updateOne(query, updateDoc);
      if (result.modifiedCount === 0) {
        return res.status(404).send({ message: "User not found!" });
      }
      res.send(result);
      
    })

    // Delete a user From DB
    app.delete("/user/:id", async (req, res) => {
      const userId = req.params.id;
      console.log(parseInt(userId));
      const query = { _id: new ObjectId(userId)}
      const result = await userCollection.deleteOne(query);
      if (result.deletedCount === 0) {
        return res.status(404).send({ message: "User not found!" });
      }
      res.send(result);
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
