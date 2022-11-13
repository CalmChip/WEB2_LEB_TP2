const express = require("express");
const router = express.Router();
const { estAuthentifie } = require("../config/auth");
const Livres = require("../modeles/usagers");

//ajout des config d'authentification globale
router.get("/", (requete, reponse) => reponse.render("login")); //render la page login
router.get("/index", (requete, reponse) => reponse.render("login")); //render la page login
router.get("/index.html", (requete, reponse) => reponse.render("login")); //render la page login

router.get("/acceuil", estAuthentifie, (requete, reponse) => {
  reponse.render("acceuil");
});

module.exports = router;
