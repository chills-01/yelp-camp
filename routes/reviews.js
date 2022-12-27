const express = require("express");
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

// post a new review to a campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// deleting a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;