const express = require('express');

const router = express.Router();

router.get("/", (req, res) => {
    res.send("hello Dharm U r doing good job till now !")
})

module.exports = router;