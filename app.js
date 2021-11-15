const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
require ('dotenv/config');

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use(routes);

// DB
mongoose.connect(process.env.DB_URI);
mongoose.connection.on("connected", () => {
  console.log('Connected to the database');
})

app.listen(5000);