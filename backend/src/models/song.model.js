const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      default: "Moodify Artist",
      trim: true,
    },
    album: {
      type: String,
      default: "Emotion Spectrum",
      trim: true,
    },
    duration: {
      type: String,
      default: "3:20",
    },
    url: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      required: true,
      default: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
    },
    mood: {
      type: String,
      enum: {
        values: ["sad", "happy", "surprised", "calm", "neutral"],
        message: "Mood must be sad, happy, surprised, calm, or neutral",
      },
      default: "happy",
      lowercase: true,
    },
  },
  { timestamps: true }
);

const songModel = mongoose.model("Song", songSchema);

module.exports = songModel;
