const express = require("express");
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const campgrounds = require('../controllers/campgrounds');


const router = express.Router();

// render form for new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// endpoint for form
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// get index of all campgrounds
router.get('/', catchAsync(campgrounds.index));

// show a certain campground details
router.get('/:id', catchAsync(campgrounds.showCampground));

// render edit form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// endpoint for update
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// delete campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;