const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/autoLogin", authController.protect, authController.autoLogin);

router
  .route("/")
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(authController.protect, userController.updateUser)
  .delete(userController.deleteUser);

router
  .route("/lists/:id")
  .post(authController.protect, userController.addItemToList)
  .delete(authController.protect, userController.removeItemFromList);

router
  .route("/lists/updateItemRating/:id")
  .patch(authController.protect, userController.updateItemRating);

module.exports = router;
