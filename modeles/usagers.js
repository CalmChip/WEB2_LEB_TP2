const mongoose = require("mongoose");

//schéma de données pour la collection usagers_v2
// _id, nom, password, roles, date

let schemaUsager = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  roles: {
    type: Array,
    required: true,
  },
  fichierImage: {
    type: String,
    required: true,
  },
});

//export
let Usagers = (module.exports = mongoose.model("usagers2", schemaUsager));

module.exports.getUsagersByID = (idUser, callback) => {
  let filtre = { _id: idUser };
  Usagers.findById(filtre, callback);
};

module.exports.deleteUnUsager = (query, callback) => {
  let filtre = { _id: query };
  Usagers.deleteOne(filtre, callback);
};

module.exports.modifierUnUsager = (query, newUser, callback) => {
  let filtre = { _id: query };
  let options = {};
  let nouveauUser = {
    nom: newUser.nom,
    password: newUser.password,
    roles: newUser.roles,
    fichierImage: newUser.fichierImage,
  };
  Usagers.findOneAndUpdate(filtre, nouveauUser, options, callback);
};
