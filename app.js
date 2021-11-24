const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const session = require('express-session');
const cors = require('cors');
require ('dotenv/config');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Routes
app.use(routes);

// DB
mongoose.connect(process.env.DB_URI);
mongoose.connection.on("connected", () => {
  console.log('Connected to the database');
})

app.listen(5000);
