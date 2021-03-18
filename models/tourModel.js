const mongoose = require('mongoose');
const slugify = require('slugify');
// IMPORT USER WHEN EMBEDDING, NOT WHEN REFERENCING
// const User = require('./userModel');
// const validator = require('validator'); // THIRD PARTY VALIDATOR

// TOUR SCHEMA
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'], // BUILT-IN VALIDATOR
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name must be 40 characters max'], // BUILT-IN VALIDATOR
      minlength: [10, 'Tour name must be 10 characters minimum'], // BUILT-IN VALIDATOR
      // validate: [validator.isAlpha, 'Tour name must be only letters and no spaces'], // THIRD PARTY VALIDATOR
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have difficulty set'],
      trim: true,
      enum: {
        // BUILT-IN VALIDATOR
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: Easy, Medium or Difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Minimum must be 1.0 or more'], // BUILT-IN VALIDATOR
      max: [5, 'Minimum must be 5.0 or less'], // BUILT-IN VALIDATOR
      set: (val) => val.toFixed(1), // Set is for running a callback function when creating or updating a value
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // CUSTOM VALIDATOR
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) cannot be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // Select: hide this field from selecion queries
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // WITH EMBEDDING
    //guides: Array,
    // WITH REFERENCING
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // no need to import/require when referencing
      },
    ],
  },
  // Options to show virtual properties that don't are stored in the DB
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// INDEXING FOR BETTER PERFORMANCE
// 1 for ascending, -1 for descending order
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
// Index for geospatial
tourSchema.index({ startLocation: '2dsphere' });

// VIRTUAL PROPERTIES (NOT PERSISTED IN DATABASE)
tourSchema.virtual('durationWeeks').get(function () {
  return Math.ceil(this.duration / 7);
});

// Virtual Populate: VIRTUALLY REFERENCING TOURS TO REVIEWS TO PREVENT OVERLOADING THE DB
tourSchema.virtual('reviews', {
  ref: 'Review',
  // foreignField is the name of the property in the remote collection (tour in Review)
  foreignField: 'tour',
  // localField is the local property attached to the remote collection (reviews have tours assigned via the id)
  localField: '_id',
});

// MONGOOSE DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// EMBEDDING USERS IN THE MODEL
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

// POST MIDDLEWARE
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// Populate querys, only for querys and not visible on DB
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`QUERY took ${(Date.now() - this.start) / 1000} seconds`);
  next();
});

// AGGREGATION MIDDLEWARE
// Causes problems because $geoNear expects to be the first parameter in the aggregation
// Can solve it with an IF statement
// tourSchema.pre('aggregate', function (next) {
//   // Add a new match at the beginning of the pipeline to filter secret tours
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// TOUR MODEL
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// Create document based on model
// const testTour = new Tour({
//   name: 'The Park Camper',
//   // rating: 4.7,
//   price: 997,
// });
// testTour.save().then((doc) => console.log(doc));
