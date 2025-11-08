const express = require("express");
const router = express.Router();
const { getSkills, saveSkills } = require("../controllers/skillsController");

router.get("/skills/:email", getSkills);
router.post("/skills", saveSkills);

module.exports = router;
