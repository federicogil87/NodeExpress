const express = require('express');
const morgan = require('morgan');
// express-rate-limit is used to limit maximum API calls in a determined time
const rateLimit = require('express-rate-limit');
// Helmet is used to Set Secure Http headers
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const usersRouter = require('./routes/usersRoutes');
const toursRouter = require('./routes/toursRoutes');
const reviewsRouter = require('./routes/reviewRoutes');

const app = express();

// #############################################################################
// ## MIDDLEWARE
// ##########################
// Set Security HTTP Headers
// Best to call Helmet early in the middleware stack
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 1 hour',
});

app.use('/api', limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Defining Own Middleware (use next keyword to define middleware)
// Middleware applies to all routers
app.use((req, _, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// #############################################################################
// ## ROUTES
// ##########################

// This methods are the same as below but less readable
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);

// Middleware to handle undefined URLs
// Declared after it passes all other routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server...`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server...`);
  // err.statusCode = 404;
  // err.status = 'fail';

  next(new AppError(`Can't find ${req.originalUrl} on this server...`, 404));
});

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
