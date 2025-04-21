// models/index.js
// Asosiasi Anime dengan Seiyu & Karakter (melalui movie_seiyu)
Movie.belongsToMany(Seiyu, { 
    through: 'movie_seiyu',
    foreignKey: 'movie_id',
    otherKey: 'seiyu_id'
  });
  
  Movie.belongsToMany(Karakter, { 
    through: 'movie_seiyu',
    foreignKey: 'movie_id',
    otherKey: 'karakter_id'
  });
  
  // Asosiasi Anime dengan Staff
  Movie.belongsToMany(Staff, { 
    through: 'movie_staff',
    foreignKey: 'movie_id',
    otherKey: 'staff_id'
  });
  
  // Asosiasi Anime dengan Genre & Theme
  Movie.belongsToMany(Genre, { 
    through: 'movie_genres',
    foreignKey: 'movie_id',
    otherKey: 'genre_id'
  });
  
  Movie.belongsToMany(Theme, { 
    through: 'movie_themes',
    foreignKey: 'movie_id',
    otherKey: 'theme_id'
  });