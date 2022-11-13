const mongoose = require("mongoose");

let schemaLivres = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  titre: {
    type: String,
    required: true,
  },
  auteur: {
    type: String,
    required: true,
  },
  résumé: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  langue: {
    type: String,
    required: true,
  },
  prix: {
    type: Number,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  url_image: {
    type: String,
    required: true,
  },
});

//export
let Livres = (module.exports = mongoose.model("livres", schemaLivres));

module.exports.getLivresByID = (idLivre, callback) => {
  let filtre = { _id: idLivre };
  Livres.findById(filtre, callback);
};

module.exports.deleteUnLivre = (query, callback) => {
  let filtre = { _id: query };
  Livres.deleteOne(filtre, callback);
};

module.exports.modifierUnLivre = (query, newBook, callback) => {
  let filtre = { _id: query };
  let options = {};
  let nouveauLivre = {
    titre: newBook.titre,
    auteur: newBook.auteur,
    résumé: newBook.résumé,
    langue: newBook.langue,
    prix: newBook.prix,
    genre: newBook.genre,
    date: newBook.date,
    url_image: newBook.url_image,
  };
  Livres.findOneAndUpdate(filtre, nouveauLivre, options, callback);
};
