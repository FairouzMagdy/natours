const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      minLength: [
        10,
        'A tour name must have more than or equal to 10 characters',
      ],
      maxLength: [
        40,
        'A tour name must have less than or equal to 40 characters',
      ],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be either easy, medium or difficult',
      },
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation (won't work with update)
          return val < this.price;
        },
        message: 'Price Discount ({VALUE}) must be less than actual price.',
      },
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    openingHours: {
      type: String,
    },
    summary: {
      type: String,
      trim: true,
      default: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document Middleware: used before save() and create()
// save is called a hook
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); // this keyword points to the current document being processed
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save Document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   console.log('Saved.');
//   next(); // Not needed but it's best practice to keep it.
// });

// Query Middleware: Allows us to run functions before or after a certain query is executed
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.startTime = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query finished in ${Date.now() - this.startTime} milliseconds`);
  // console.log(docs);
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
