const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapboxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mapboxToken });

const itemsPerPage = 12;

const sortByTranslate = {
    highRate: ["averageRating", -1],
    highPrice: ["price", -1],
    lowPrice: ["price", 1],
};

// retrieves sorted page of campgrounds
async function retrieveCampgrounds(params) {
    const { sortBy, currentPage } = params;
    const campgrounds = await Campground.find({})
        .sort([sortByTranslate[sortBy]])
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);
    return campgrounds;
}

// implementing sorting into
// highest rated
// lowest price
// nearest to me?

module.exports.index = async (req, res) => {
    const numProducts = await Campground.count();
    const params = {
        currentPage: Number(req.query.page) || 1,
        sortBy: req.query.sortBy || "highRate",
        numPages: Math.ceil(numProducts / itemsPerPage),
    };

    // return data for mapbox (not really sure of a good way of loading all this data)
    const geoCampgrounds = await Campground.find({}).select(
        "geometry dateCreated"
    );

    const campgrounds = await retrieveCampgrounds(params);
    res.render("campgrounds/index", {
        campgrounds,
        geoCampgrounds,
        ...params,
    });

};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    // req to mapbox
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("author");
    if (!campground) {
        req.flash("error", "Campground not found");
        res.redirect("/campgrounds");
    } else {
        res.render("campgrounds/show", { campground });
    }
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Campground not found");
        res.redirect("/campgrounds");
    } else {
        res.render("campgrounds/edit", { campground });
    }
};
// could do the update in one step
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs); // add images to current list
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }
    await campground.save();
    req.flash("success", "Sucessfully updated campground.");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
};
