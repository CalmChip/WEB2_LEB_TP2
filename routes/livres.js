const express = require("express");
const passport = require("passport");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Livres = require("../modeles/livres");
const { estAuthentifie, estGestion } = require("../config/auth");

// Route permettant l'acces a la page des livres
router.get("/", estAuthentifie, (requete, reponse) => {
  Livres.find({}, (err, tousLivres) => {
    if (err) throw err;
    reponse.render("livres", {
      user: requete.user,
      tousLivres: tousLivres,
    });
  });
});
// route permettant la deconnection
router.get("/logout", estAuthentifie, (requete, reponse) => {
  requete.logout((err) => {
    if (err) throw err;
    requete.flash("succes_msg", "Déconnection réeussis.");
    reponse.redirect("/usagers/login");
  });
});

// route permettant l'acces a la page editer un livre
router.get("/editer/:id", estAuthentifie, estGestion, (requete, reponse) => {
  Livres.getLivresByID(requete.params.id, (err, msg) => {
    if (err) throw err;
    reponse.render("editLivres", { livre: msg });
  });
});

router.post("/modify/:id", estAuthentifie, estGestion, (requete, reponse) => {
  let query = requete.params.id;
  let newBook = requete.body;
  Livres.modifierUnLivre(query, newBook, (err, msg) => {
    if (err) throw err;
    if (msg) console.log(msg);
    requete.flash("succes_msg", "Livre modifier avec succes.");
    reponse.redirect("/livres/");
  });
});

// route permettant l'acces a la page supprimer un livre
router.get("/supprimer/:id", estAuthentifie, estGestion, (requete, reponse) => {
  Livres.getLivresByID(requete.params.id, (err, msg) => {
    if (err) throw err;
    reponse.render("supprimerLivres", { livre: msg });
  });
});
router.get("/delete/:id", estAuthentifie, estGestion, (requete, reponse) => {
  Livres.deleteUnLivre(requete.params.id, (err, livre) => {
    if (err) throw err;
    requete.flash("succes_msg", "Livre supprimers...");
    reponse.redirect("/livres/");
  });
});

// route permettant l'acces a la page ajouter un livre
router.get("/ajouter", estAuthentifie, estGestion, (requete, reponse) => {
  reponse.render("ajoutLivres");
});

// route permettant l'ajout d'un nouveau livre
router.post("/register", estAuthentifie, estGestion, (requete, reponse) => {
  const { titre, auteur, langue, prix, genre, résumé, date, url_image } =
    requete.body;
  let erreurs = [];
  let _id = titre + auteur;
  if (
    !titre ||
    !auteur ||
    !langue ||
    !prix ||
    !genre ||
    !résumé ||
    !date ||
    !url_image
  ) {
    erreurs.push({ msg: "Remplir tous les champs" });
  }
  if (erreurs.length > 0) {
    reponse.render("ajoutLivres", {
      erreurs,
      titre,
      auteur,
      langue,
      prix,
      genre,
      résumé,
      date,
      url_image,
    });
  } else {
    Livres.findById(_id).then((livre) => {
      if (livre) {
        erreurs.push({ msg: "Ce livre existe deja" });
        reponse.render("ajoutLivres", {
          erreurs,
          titre,
          auteur,
          langue,
          prix,
          genre,
          résumé,
          date,
          url_image,
        });
      } else {
        const nouveauLivre = new Livres({
          _id,
          titre,
          auteur,
          langue,
          prix,
          genre,
          résumé,
          date,
          url_image,
        });
        nouveauLivre
          .save()
          .then((livre) => {
            requete.flash("succes_msg", "Livre ajouté...");
            reponse.redirect("/livres/");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  }
});

module.exports = router;
