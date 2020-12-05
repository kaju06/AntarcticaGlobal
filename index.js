const express = require('express')
const bodyparser = require('body-parser')
const app = express()
const user = require('./routes/user')
const cors = require('cors')
const mongoose = require('mongoose');
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
mongoose.connect('mongodb://localhost/antarctica');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to mongodb!")
});
app.use('/users', user)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`)
})