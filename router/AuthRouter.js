const express = require("express");
const router = express.Router();
const { register, login, getUser } = require("../controller/AuthController");
const { verifyToken } = require("../middleware/AuthMiddleware");

router.post("/", verifyToken, register);
router.post("/login", verifyToken, login);
router.get("/", verifyToken, getUser);

module.exports = router;
