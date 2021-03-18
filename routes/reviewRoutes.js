const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// mergeParams: true to get parameters from previous router (in this case tourId from /tours/:tourId/reviews)
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

// prettier-ignore
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo("user"),
        reviewController.setTourUserIDs,
        reviewController.createReview);

// prettier-ignore
router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
      authController.restrictTo('admin', "user"),
      reviewController.updateReview)
    .delete(
      authController.restrictTo('admin', "user"),
      reviewController.deleteReview
);
module.exports = router;
