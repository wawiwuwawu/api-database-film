const { User, Movie, MovieList } = require("../models");
const { sequelize } = require("../models");

const saveList = async (req, res) => {
    console.log('req.body:', req.body);
  try {
    const { userId, movieId, status } = req.body;
    if (!userId || !movieId || !status) {
      return res.status(400).json({ success: false, message: "userId, movieId, and status are required" });
    }


    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    let listEntry = await MovieList.findOne({
      where: { user_id: userId, movie_id: movieId }
    });

    if (listEntry) {
      listEntry.status = status;
      await listEntry.save();
      return res.status(200).json({ success: true, message: "List updated", data: listEntry });
    } else {
      const newList = await MovieList.create({
        user_id: userId,
        movie_id: movieId,
        status
      });
      return res.status(201).json({ success: true, message: "List created", data: newList });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const deleteList = async (req, res) => {
  try {
    const { userId, movieId } = req.params;
    if (!userId || !movieId) {
      return res.status(400).json({ success: false, message: "userId and movieId are required" });
    }

    const listEntry = await MovieList.findOne({
      where: { user_id: userId, movie_id: movieId }
    });

    if (!listEntry) {
      return res.status(404).json({ success: false, message: "List not found" });
    }

    await listEntry.destroy();
    return res.status(200).json({ success: true, message: "List deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserList = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const lists = await MovieList.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Movie,
          as: "movie",
          attributes: ["id", "judul", "tahun_rilis", "rating", "cover_url"]
        }
      ]
    });

    return res.status(200).json({ success: true, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update status list (by userId & movieId)
const updateList = async (req, res) => {
  try {
    const { userId, movieId } = req.params;
    const { status } = req.body;
    if (!userId || !movieId || !status) {
      return res.status(400).json({ success: false, message: "userId, movieId, and status are required" });
    }
    const listEntry = await MovieList.findOne({ where: { user_id: userId, movie_id: movieId } });
    if (!listEntry) {
      return res.status(404).json({ success: false, message: "List not found" });
    }
    listEntry.status = status;
    await listEntry.save();
    return res.status(200).json({ success: true, message: "List updated", data: listEntry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search list by movie name (for a user)
const searchListByMovieName = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.query;
    if (!userId || !name) {
      return res.status(400).json({ success: false, message: "userId and name are required" });
    }
    const lists = await MovieList.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Movie,
          as: "movie",
          where: { judul: { [sequelize.Op.like]: `%${name}%` } },
          attributes: ["id", "judul", "tahun_rilis", "rating", "cover_url"]
        }
      ]
    });
    return res.status(200).json({ success: true, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Statistik List User
const getUserListStats = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }
    // Hitung jumlah list per status
    const stats = await MovieList.findAll({
      where: { user_id: userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });
    // Format hasil agar mudah dipakai di frontend
    const result = { disimpan: 0, ditonton: 0, 'sudah ditonton': 0 };
    stats.forEach(row => {
      result[row.status] = parseInt(row.get('count'));
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
    saveList,
    deleteList,
    getUserList,
    updateList,
    searchListByMovieName,
    getUserListStats
};