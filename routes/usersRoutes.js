const express = require('express');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/forgotPassword', authController.forgotPassword);

// AUTHENTICATED ACTIONS
// Middleware runs in sequence, every route below this middleware will have it attached
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

// prettier-ignore
router
  .get("/me", 
  usersController.getMe,
  usersController.getUser)

// prettier-ignore
router
  .patch('/updateMe', 
  usersController.updateMe);

// prettier-ignore
router
  .delete('/deleteMe', 
    usersController.deleteMe);

// Routes protected to admins only
router.use(authController.restrictTo('admin'));

// prettier-ignore
router
  .route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createUser);

// prettier-ignore
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
