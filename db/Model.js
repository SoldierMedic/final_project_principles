const mongoose = require('mongoose');

//connection to mongoDb
mongoose.connect('mongodb+srv://annaswaheed:gQZuFTRnu83kK3oN@classproject.hogiwua.mongodb.net/FullStack?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoCreate : true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('Error connecting to MongoDB Atlas', err);
});


const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  alias: String,
  title: String
});

const CoordinatesSchema = new Schema({
  latitude: Number,
  longitude: Number
});

const LocationSchema = new Schema({
  address1: String,
  address2: String,
  address3: String,
  city: String,
  zip_code: String,
  country: String,
  state: String,
  display_address: [String]
});

const ReviewUser = new Schema({
  id: String,
  profile_url: String,
  image_url: String,
  name: String
});

const ReviewSchema = new Schema({
  id: String,
  url: String,
  text: String,
  rating: Number,
  time_created: String,
  user: ReviewUser
});

const BusinessSchema = new Schema({
  id: String,
  alias: String,
  name: String,
  image_url: String,
  is_closed: Boolean,
  url: String,
  review_count: Number,
  categories: [CategorySchema],
  rating: Number,
  coordinates: CoordinatesSchema,
  transactions: [String],
  price: String,
  location: LocationSchema,
  phone: String,
  display_phone: String,
  distance: Number,
  reviews: [ReviewSchema]
});

const Business = mongoose.model('Business', BusinessSchema);

//schema for a student document
const UserSchema = new mongoose.Schema({
  firstname: {
    type: String, 
    required: true,
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone:{
    type: String,
    required: false
  },
  address:{
    type: String,
    required: false
  },
  DOB:{
    type: String,
    required: false
  },
  businesses: [BusinessSchema]
});

// create an instance that has studentSchema
// datastructure and points to my db and collection
const User = mongoose.model('SaviorAI', UserSchema, 'SaviorAI');

module.exports = User;