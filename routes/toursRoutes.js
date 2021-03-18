const express = require('express');
const toursController = require('../controllers/toursController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', toursController.checkID);

router.use('/:tourId/reviews', reviewRouter);

// #############################################################################
// ## ROUTES
// ##########################

// This methods are the same as below but less readable
// router.get('/api/v1/tours', getAllTours);
// router.post('/api/v1/tours', createTour);
// router.get('/api/v1/tours/:id', getTour);
// router.patch('/api/v1/tours/:id', updateTour);
// router.delete('/api/v1/tours/:id', deleteTour);

// prettier-ignore
router
  .route('/top-5-cheap')
  .get(toursController.aliasTopTours, toursController.getAllTours)

// prettier-ignore
router
  .route('/tour-stats')
  .get(toursController.getTourStats)

// prettier-ignore
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect, 
    authController.restrictTo("admin", "lead-guide", "guide"), 
    toursController.getMonthlyPlan)

// GeoSpatial
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(toursController.getToursWithin);

// prettier-ignore
router
  .route('/distances/:latlng/unit/:unit')
  .get(toursController.getDistances);

// prettier-ignore
router
  .route('/')
  .get(toursController.getAllTours)
  .post(
    authController.protect, 
    authController.restrictTo("admin", "lead-guide"), 
    toursController.createTour);

// prettier-ignore
router
  .route('/:id')
  .get(toursController.getTour)
  .patch(
    authController.protect, 
    authController.restrictTo("admin", "lead-guide"), 
    toursController.updateTour)
  .delete(
    authController.protect, 
    authController.restrictTo("admin", "lead-guide"), 
    toursController.deleteTour);

module.exports = router;
