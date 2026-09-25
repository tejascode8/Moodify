const songModel = require("../models/song.model");
const storageService = require("../services/storage.service");
const id3 = require("node-id3");

const DEFAULT_POSTER = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80";

async function uploadSong(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided in request." });
    }

    const songBuffer = req.file.buffer;
    const { mood = "happy", title: customTitle, artist: customArtist } = req.body;

    let tags = {};
    try {
      tags = id3.read(songBuffer) || {};
    } catch (e) {
      console.warn("ID3 read warning:", e.message);
    }

    const songTitle = customTitle || tags.title || req.file.originalname.replace(/\.[^/.]+$/, "") || "Untitled Track";
    const songArtist = customArtist || tags.artist || "Moodify Artist";

    // 1. Upload audio file
    const songFile = await storageService.uploadFile({
      buffer: songBuffer,
      filename: `${Date.now()}_${songTitle.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`,
      folder: "/cohort-2/moodify/songs",
    });

    // 2. Upload cover art if embedded in ID3, otherwise use default
    let posterUrl = DEFAULT_POSTER;
    if (tags.image && tags.image.imageBuffer) {
      try {
        const posterFile = await storageService.uploadFile({
          buffer: tags.image.imageBuffer,
          filename: `${Date.now()}_${songTitle.replace(/[^a-zA-Z0-9]/g, "_")}.jpeg`,
          folder: "/cohort-2/moodify/posters",
        });
        posterUrl = posterFile.url;
      } catch (imgErr) {
        console.warn("Cover image upload failed, using default:", imgErr.message);
      }
    }

    const song = await songModel.create({
      title: songTitle,
      artist: songArtist,
      url: songFile.url,
      posterUrl,
      mood: mood.toLowerCase(),
    });

    return res.status(201).json({
      message: "Song uploaded successfully",
      song,
    });
  } catch (err) {
    console.error("uploadSong error:", err);
    return res.status(500).json({
      message: "Failed to upload song",
      error: err.message,
    });
  }
}

async function getSong(req, res) {
  try {
    const { mood, single } = req.query;
    const query = {};

    if (mood) {
      const normalizedMood = mood.toLowerCase() === "neutral" ? "calm" : mood.toLowerCase();
      query.mood = normalizedMood;
    }

    const songs = await songModel.find(query).sort({ createdAt: -1 });

    if (single === "true" || single === "1") {
      const song = songs.length > 0 ? songs[0] : null;
      return res.status(200).json({
        message: "Song fetched successfully.",
        song,
      });
    }

    return res.status(200).json({
      message: "Songs fetched successfully.",
      songs,
      song: songs.length > 0 ? songs[0] : null,
      count: songs.length,
    });
  } catch (err) {
    console.error("getSong error:", err);
    return res.status(500).json({
      message: "Failed to retrieve songs",
      error: err.message,
    });
  }
}

async function deleteSong(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Song ID is required" });
    }

    const deleted = await songModel.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Song deleted successfully",
      deletedId: id,
    });
  } catch (err) {
    console.error("deleteSong error:", err);
    return res.status(500).json({
      message: "Failed to delete song",
      error: err.message,
    });
  }
}

module.exports = { uploadSong, getSong, deleteSong };
