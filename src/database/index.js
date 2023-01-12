const mongoose = require('mongoose');

mongoose.set("strictQuery", false);
mongoose.connect('mongodb://localhost/nodereset');
mongoose.Promise = global.Promise;

module.exports = mongoose;