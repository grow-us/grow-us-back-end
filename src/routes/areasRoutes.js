const express = require("express");
const router = express.Router();
const { getAreas, saveAreas } = require("../controllers/areasController");

router.get("/areas/:email", getAreas);
router.post("/areas", saveAreas);

module.exports = router;
