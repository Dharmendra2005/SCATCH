const express = require("express");

const router = express.Router();

router.get("/create-upi-session", async (req, res) => {
    try {

        res.render("upiSession");

    } catch(err) {
        res.status(500).json({ error: "UPI session creation failed" });
    }
});



module.exports = router;