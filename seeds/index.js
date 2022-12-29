const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapboxToken = 'pk.eyJ1IjoiY2hpbGxzMDEiLCJhIjoiY2xjOHpmNzJpMXAwYjN3cWs5dXBxZ3VxNSJ9.uCFXZT6LjzPUZ9bd_Gfz0A'

const geocoder = mbxGeocoding({ accessToken: mapboxToken });

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});

// grabs random el from arr
const sample = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({}); // delete everything

    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const location = `${cities[random1000].city}, ${cities[random1000].state}`

        // CAUTION WITH SEEDING!!
        const geoData = await geocoder.forwardGeocode({
            query: location,
            limit: 1
        }).send()

        const camp = new Campground({
            author: '63a96181c7bc4114deb70fca',
            location,
            geometry: geoData.body.features[0].geometry,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{
                url: 'https://res.cloudinary.com/dx2dsisqo/image/upload/v1672127881/YelpCamp/sx5w6susgme8npbmxypz.jpg',
                filename: 'YelpCamp/sx5w6susgme8npbmxypz'
            },
            {
                url: 'https://res.cloudinary.com/dx2dsisqo/image/upload/v1672127881/YelpCamp/fi5s7f20zska0npwa6ka.webp',
                filename: 'YelpCamp/fi5s7f20zska0npwa6ka'

            }],
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Incidunt delectus sapiente, molestiae tempora labore sequi consectetur inventore? Dolorem illo quos, ut, doloribus aut molestiae enim quia ex corporis architecto cupiditate? Consectetur fugit maxime ea officiis voluptatibus numquam velit eos ad architecto quis dolores quam et cumque sequi laudantium, amet reiciendis. Vel quae illum quaerat laborum quia rem eius explicabo fugit?',
            price
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});