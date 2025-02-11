const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  user: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  startHour: { type: String },
  endHour: { type: String },
  hours: { type: Number }
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;
