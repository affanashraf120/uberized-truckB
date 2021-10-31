const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ridesSchema = new Schema(
  {
    pickup: {
      type: Object,
      required: true,
    },
    destination: {
      type: Object,
      required: true,
    },
    distance: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    driver: {
      type: Object,
      required: true,
    },
    client: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
    },
    review: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const Rides = mongoose.model("Rides", ridesSchema);
module.exports = Rides;
