const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);

    // update average rating
    campground.averageRating = updateAverageRating(
        campground.averageRating,
        campground.reviews.length - 1, // new already pushed
        review.rating,
        campground.reviews.length
    );
    await review.save();
    await campground.save();
    req.flash("success", "Created new review");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    }); //  delete reference

    const review = await Review.findByIdAndDelete(reviewId); // delete review

    // update average rating
    campground.averageRating = updateAverageRating(
        campground.averageRating,
        campground.reviews.length, 
        -review.rating, // decrease rating by review.rating
        campground.reviews.length - 1 
    );
    campground.save();

    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
};

// could have on object?
function updateAverageRating(oldAverage, oldLength, newRating, newLength) {
    const newAverage = (oldAverage * oldLength + newRating) / newLength;
    if (newAverage < 0 || newLength === 0) return 0;
    return newAverage;
}
