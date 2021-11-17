const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const session = require('express-session');
const cors = require('cors');
require ('dotenv/config');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

// Routes
app.use(routes);

// DB
mongoose.connect(process.env.DB_URI);
mongoose.connection.on("connected", () => {
  console.log('Connected to the database');
})

app.listen(5000);
