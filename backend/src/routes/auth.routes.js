const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

router.post("/", authController.loginUser);

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get("/get-me", authMiddleware.authUser, authController.getMe);

router.post("/logout", authController.logoutUser);

module.exports = router;
