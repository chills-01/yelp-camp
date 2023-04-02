const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const dateText = require("../utils/dateText");

const ImageSchema = new Schema({
    url: String,
    filename: String,
});
// https://res.cloudinary.com/dx2dsisqo/image/upload/v1672128032/YelpCamp/m9mkv5mwtbtwjttpo26z.jpg
ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema(
    {
        dateCreated: {
            type: Date,
            default: new Date(),
        },
        title: String,
        images: [ImageSchema],
        geometry: {
            type: {
                type: String, // Don't do `{ location: { type: String } }`
                enum: ["Point"], // 'location.type' must be 'Point'
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        price: Number,
        description: String,
        location: String,
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
        averageRating: {
                type: Number,
                default: 0,
                minimum: 0,
                maximum: 5,
            },
    },
    opts
);

CampgroundSchema.virtual("properties.popupMarkup").get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
});

// used for the XX days ago function on show page
CampgroundSchema.virtual("timeSinceCreation").get(function () {
    const start = new Date();
    const end = this.dateCreated;
    // check separate year
    if (start.getFullYear() !== end.getFullYear()) {
        return `Listed ${dateText(
            start.getFullYear(),
            end.getFullYear(),
            "year"
        )} ago`;
    }
    // check separate month
    else if (start.getMonth() !== end.getMonth()) {
        return `Listed ${dateText(
            start.getMonth(),
            end.getMonth(),
            "month"
        )} ago`;
    }
    // check separate day
    else if (start.getDate() !== end.getDate()) {
        return `Listed ${dateText(start.getDate(), end.getDate(), "day")} ago`;
    } else {
        return "Listed Today";
    }
});

// only triggered when 'findOneAndDelete' is called by 'findByIdAndDelete'
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews,
            },
        });
    }
});
module.exports = mongoose.model("Campground", CampgroundSchema);
