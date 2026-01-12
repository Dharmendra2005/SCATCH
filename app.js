const express = require('express');
const app = express();
const path = require('path');
// const userModel = require("./models/user-model");
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(3000);
