const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 4001;

// Middleware configuration
app.use(cors());
app.use(express.json());

// Verify Token MiddleWare
// const verifyToken = (req, res, next) => {
//   const authoraization = req.header.authorization;

//   if (!authoraization || !authoraization.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .send({ message: "Access denied. No token provided." });
//   }

//   const token = authoraization.split(" ")[1];
//   console.log(token);
//   jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
//     if (err)
//       return res.status(403).send({ message: "Access denied. Invalid token." });
//     req.user = decoded;
//     next();
//   });
// };

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

    // ======================= JWT Related =======================

    // Admin Verify
    // const verifyAdmin = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await userCollection.findOne(query);
    //   const isAdmin = user?.role === "admin";
    //   console.log(user?.role);
    //   console.log(isAdmin);
    //   if (!isAdmin) {
    //     return res.status(403).send({ message: "Forbidden Access" });
    //   }
    //   next();
    // };

    // Seller Verify
    // const verifySeller = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await userCollection.findOne(query);
    //   const isSeller = user?.role === "seller";
    //   if (!isSeller) {
    //     return res.status(403).send({ message: "Forbidden Access" });
    //   }
    //   next();
    // };

    //  Verify a User is authenticated ===========
    // app.post("/authentication", async (req, res) => {
    //   const userEmail = req.body;
    //   const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN, {
    //     expiresIn: "30d",
    //   });
    //   res.send({ token });
    // });

    // ============================= Product Related API =============================
    // TODO: Implement Seller Verification For This API
    // Add a New Product
    app.post("/prouct", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    // Get The All Product Data 
    app.get("/products", async (req, res) => {
      const product = req.body;
      const products = await productCollection.find(product).toArray();
      res.send(products);
    });

    // TODO: Implement Seller Verification For This API
    // Get Single Product Data using Id
    app.get('/product/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    })

    // TODO: Implement Seller Verification For This API
    // Get Single Product for updateing the existing product data
    app.patch("/products/update/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedProduct = {
        $set: {
          productName: product.productName,
          productImage: product.productImage,
          productPrice: product.productPrice,
          productQuantity: product.productQuantity,
          productCategory: product.productCategory,
          productBrand: product.productBrand,
          productDescription: product.productDescription,
          sellerEmail: product.sellerEmail,
          sellerStatus: product.sellerStatus,
        },
      };
      const result = await productCollection.updateOne(query, updatedProduct);
      res.send(result);
    });

    // Get All Product Data for a Specific Seller with Seller Email
    app.get("/products/:email", async (req, res) => {
      const email = req.params.email;
      const query = { sellerEmail: email };
      const products = await productCollection.find(query).toArray();
      res.send(products);
    });

    // TODO: Implement Seller Verification
    // Delete Products From Collection
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

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

    // TODO: Implement Admin Verification For This API
    // Get The All user Data
    app.get("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.find(user).toArray();
      res.send(result);
    });

    // TODO: Implement Admin Verification For This API
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

    // TODO: Implement Admin Verification For This API
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
        },
      };
      const query = { _id: new ObjectId(Id) };
      const result = await userCollection.updateOne(query, updateDoc);
      if (result.modifiedCount === 0) {
        return res.status(404).send({ message: "User not found!" });
      }
      res.send(result);
    });

    // TODO: Implement Admin Verification For This API
    // Delete a user From DB
    app.delete("/user/:id", async (req, res) => {
      const userId = req.params.id;
      const query = { _id: new ObjectId(userId) };
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
