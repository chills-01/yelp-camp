const express = require("express");
const catchAsync = require('../utils/catchAsync');
const {validateReview} = require('../middleware')
const Campground = require('../models/campground');
const Review = require('../models/review');

const router = express.Router({ mergeParams: true });

// post a new review to a campground
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campground._id}`)
}));

// deleting a review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //  delete reference
    await Review.findByIdAndDelete(reviewId); // delete review
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`)

}));

module.exports = router;