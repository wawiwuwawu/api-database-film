const { body, param } = require("express-validator");


const movieValidationRules = [
  body("judul").trim().notEmpty().withMessage("Judul tidak boleh kosong"),
  body("sinopsis").trim().notEmpty().withMessage("Sinopsis tidak boleh kosong"),
  body("tahun_rilis")
    .trim()
    .notEmpty()
    .isLength({ min: 4, max: 4 })
    .withMessage("Tahun rilis harus 4 digit"),
  body("episode")
    .trim()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Episode harus angka minimal 1"),
  body("durasi")
    .trim()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Durasi harus angka minimal 1"),
  body("type")
    .trim()
    .notEmpty()
    .isIn(["TV", "Movie", "ONA", "OVA"])
    .withMessage("Type tidak valid"),
  body("rating")
    .trim()
    .notEmpty()
    .isIn(["G", "PG", "PG-13", "R", "NC-17"])
    .withMessage("Rating tidak valid"),
];

const movieUpdateValidationRules = [
    param("id").isInt().withMessage("ID harus angka"),
    body("judul").optional().trim().notEmpty().withMessage("Judul tidak boleh kosong"),
    body("sinopsis").optional().trim().notEmpty().withMessage("Sinopsis tidak boleh kosong"),
    body("tahun_rilis")
        .optional()
        .trim()
        .isLength({ min: 4, max: 4 })
        .withMessage("Tahun rilis harus 4 digit"),
    body("episode")
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage("Episode harus angka minimal 1"),
    body("durasi")
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage("Durasi harus angka minimal 1"),
    body("type")
        .optional()
        .trim()
        .isIn(["TV", "Movie", "ONA", "OVA"])
        .withMessage("Type tidak valid"),
    body("rating")
        .optional()
        .trim()
        .isIn(["G", "PG", "PG-13", "R", "NC-17"])
        .withMessage("Rating tidak valid"),
]


const seiyuValidationRules = [
  body("name").trim().notEmpty().withMessage("Nama tidak boleh kosong"),
  body("birthday")
    .trim()
    .notEmpty()
    .isDate()
    .withMessage("Format tanggal tidak valid (YYYY-MM-DD)"),
  body("website_url").optional().isURL().withMessage("URL website tidak valid"),
  body("instagram_url").optional().isURL().withMessage("URL Instagram tidak valid"),
  body("twitter_url").optional().isURL().withMessage("URL Twitter tidak valid"),
  body("youtube_url").optional().isURL().withMessage("URL YouTube tidak valid"),
];


const seiyuUpdateValidationRules = [
  param("id").isInt().withMessage("ID harus angka"),
  body("name").optional().trim().notEmpty().withMessage("Nama tidak boleh kosong"),
  body("birthday").optional().isDate().withMessage("Format tanggal tidak valid"),
  body("website_url").optional().isURL(),
  body("instagram_url").optional().isURL(),
  body("twitter_url").optional().isURL(),
  body("youtube_url").optional().isURL(),
];


const createStaffValidationRules = [
  body("name").trim().notEmpty().withMessage("Nama tidak boleh kosong"),
  body("birthday")
    .trim()
    .notEmpty()
    .isDate()
    .withMessage("Format tanggal tidak valid (YYYY-MM-DD)"),
  body("role")
    .trim()
    .notEmpty()
    .isIn(["Director", "Producer", "Staff"])
    .withMessage("Role harus Director, Producer, atau Staff"),
];

const updateStaffValidationRules = [
  param("id").isInt().withMessage("ID harus angka"),
  body("name").optional().trim().notEmpty().withMessage("Nama tidak boleh kosong"),
  body("birthday").optional().isDate(),
  body("role").optional().isIn(["Director", "Producer", "Staff"]),
];

const validateRegistration = [
  body('name')
    .notEmpty().withMessage('Nama wajib diisi')
    .isLength({ min: 3 }).withMessage('Nama minimal 3 karakter')
    .trim(),
  body('email')
    .isEmail().withMessage('Email tidak valid')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
    .matches(/[0-9]/).withMessage('Password harus mengandung angka')
    .matches(/[a-zA-Z]/).withMessage('Password harus mengandung huruf')
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
];

module.exports = { 
    movieValidationRules,
    movieUpdateValidationRules,
    seiyuValidationRules,
    seiyuUpdateValidationRules,
    createStaffValidationRules,
    updateStaffValidationRules,
    validateRegistration,
    validateLogin
};