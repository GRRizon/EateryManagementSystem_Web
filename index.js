const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   DATABASE CONNECTION
====================== */

mongoose
  .connect(
    "mongodb+srv://75golamrabbani_db_user:YOUR_PASSWORD@cluster0.m2y2zo8.mongodb.net/eateryDB?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

/* ======================
   SCHEMAS
====================== */

// USERS
const UserSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  username: String,
  password: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const User = mongoose.model("User", UserSchema);

// MENU
const MenuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: String
});
const Menu = mongoose.model("Menu", MenuSchema);

// ORDERS
const OrderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  orderType: String,
  payment: String,
  products: [
    {
      name: String,
      qty: Number,
      price: Number
    }
  ],
  total: Number,
  status: {
    type: String,
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Order = mongoose.model("Order", OrderSchema);

/* ======================
   ROUTES
====================== */

app.get("/", (req, res) => {
  res.send("🍽 Eatery Backend Running");
});

/* ======================
   AUTH
====================== */

// SIGNUP
app.post("/signup", async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if (!fullname || !email || !username || !password)
    return res.status(400).json({ message: "All fields required" });

  const exist = await User.findOne({ username });
  if (exist)
    return res.status(400).json({ message: "Username already exists" });

  const user = await User.create({
    fullname,
    email,
    username,
    password
  });

  res.json({ message: "Signup successful", user });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (!user)
    return res.status(401).json({ message: "Invalid login" });

  res.json({ message: "Login success", user });
});

/* ======================
   MENU
====================== */

// GET MENU
app.get("/menu", async (req, res) => {
  const menu = await Menu.find();
  res.json(menu);
});

// ADD MENU (ADMIN)
app.post("/menu", async (req, res) => {
  const item = await Menu.create(req.body);
  res.json(item);
});

/* ======================
   ORDERS
====================== */

// PLACE ORDER
app.post("/order", async (req, res) => {
  const order = await Order.create(req.body);
  res.json({ message: "Order placed successfully", order });
});

// GET USER ORDERS
app.get("/orders/user/:email", async (req, res) => {
  const orders = await Order.find({ email: req.params.email }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET ALL ORDERS (ADMIN)
app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// UPDATE ORDER STATUS
app.put("/orders/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(order);
});

/* ======================
   PROFILE
====================== */

// GET PROFILE BY EMAIL
app.get("/profile/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.json(user);
});

/* ======================
   SERVER
====================== */

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
