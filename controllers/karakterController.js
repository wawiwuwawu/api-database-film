// controllers/karakterController.js
const { Karakter, Movie, Seiyu, MovieSeiyu } = require("../models");

// GET: Ambil semua karakter
const getAllKarakter = async (req, res) => {
  try {
    const karakters = await Karakter.findAll();
    if (karakters.length === 0) {
      return res
        .status(200)
        .json({ success: true, data: [], message: "Belum ada karakter tersimpan" });
    }
    return res.status(200).json({ success: true, data: karakters });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack })
      }
    });
  }
};

// GET: Ambil detail karakter termasuk movies dan seiyu
const getKarakterDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const karakter = await Karakter.findByPk(id, {
      include: [
        {
          model: Movie,
          through: { model: MovieSeiyu, attributes: [] },
          as: "movies"
        },
        {
          model: Seiyu,
          through: { model: MovieSeiyu, attributes: [] },
          as: "seiyus"
        }
      ]
    });

    if (!karakter) {
      return res.status(404).json({ success: false, message: "Karakter tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: karakter
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack })
      }
    });
  }
};

module.exports = { getAllKarakter, getKarakterDetail };
