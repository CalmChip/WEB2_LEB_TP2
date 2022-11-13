const express = require("express");
const passport = require("passport");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Usagers = require("../modeles/usagers");
const { estAuthentifie, estAdmin } = require("../config/auth");
const fs = require("fs");
const nodeJSPath = require("path");

//Route /login qui rend la page login
router.get("/login", (requete, reponse) => reponse.render("login"));

// route permettant la deconnection
router.get("/logout", (requete, reponse) => {
  requete.logout((err) => {
    if (err) throw err;
    requete.flash("succes_msg", "Déconnection réeussis.");
    reponse.redirect("/usagers/login");
  });
});

// route permettant autentification et la connection
router.post("/login", (requete, reponse, next) => {
  passport.authenticate("local", {
    successRedirect: "/acceuil",
    badRequestMessage: "Remplir tous les champs",
    failureRedirect: "/usagers/login",
    failureFlash: true,
  })(requete, reponse, next);
});

// route permettant d'obtenir le menu
router.get("/menu", estAuthentifie, (requete, reponse) => {
  Usagers.find({}, (err, tousUsagers) => {
    if (err) throw err;
    reponse.render("listeUsagers", {
      user: requete.user,
      tousUsagers: tousUsagers,
    });
  });
});

// route permettant d'obtenir la page editer, avec information sur l'usager a editer
router.get(
  "/editer/:email/:nom",
  estAuthentifie,
  estAdmin,
  (requete, reponse) => {
    reponse.render("modifier", {
      _id: requete.params.email,
      nom: requete.params.nom,
      disable: "true",
    });
  }
);

// route qui modifie un usager
router.post(
  "/modify/:email/:nom",
  estAuthentifie,
  estAdmin,
  (requete, reponse) => {
    const { originalname, destination, filename, size, path, mimetype } =
      requete.files[0];
    const {
      _id,
      nom,
      password,
      oldPass,
      roleAdmin,
      roleGestion,
      fichierImage,
    } = requete.body;
    let newUser = {
      _id: _id,
      nom: nom,
      password: password,
      roles: [],
      fichierImage: "",
    };
    const MAXFILESIZE = 2 * 1024 * 1024; //2mb = 2 * 1024mb * 1024 kilobytes
    //Image permise
    const mimetypePermis = [
      "image/jpg",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/ico",
      "image/webp",
    ];
    let tabRoles = ["normal"];
    if (roleAdmin) {
      tabRoles.push("admin");
    }
    if (roleGestion) {
      tabRoles.push("gestion");
    }
    newUser.roles = tabRoles;
    let erreurs = [];
    if (size > MAXFILESIZE) {
      erreurs.push({ msg: "Image size exceeded" });
    } else {
      if (!mimetypePermis.includes(mimetype)) {
        erreurs.push({ msg: "Filetype not allowed" });
      }
    }
    if (password) {
      if (password !== oldPass) {
        erreurs.push({ msg: "Les mots de passe ne sont pas identiques" });
      }
      if (password.length < 4) {
        erreurs.push({ msg: "Le mots de passe doit etre de 4 car. minimum" });
      }
    }
    if (erreurs.length > 0) {
      supprimerFichier(path);
      reponse.render("modifier", {
        erreurs,
        nom,
        _id,
        roleGestion,
        roleAdmin,
        disable: "true",
      });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          newUser.password = hash;
          newUser.fichierImage = conserverFichier(path, filename);
          Usagers.modifierUnUsager(
            requete.params.email,
            newUser,
            (err, msg) => {
              if (err) throw err;
              requete.flash(
                "succes_msg",
                "Usager modifier avec succes. Connectez vous pour continuer."
              );
              reponse.redirect("/usagers/login");
            }
          );
        });
      });
    }
  }
);
// route qui rend une page de confirmation pour supprimer un usager
router.get(
  "/supprimer/:email",
  estAuthentifie,
  estAdmin,
  (requete, reponse) => {
    reponse.render("pageSupprimer", { _id: requete.params.email });
  }
);
//route qui supprime un usager de la bd
router.get("/delete/:email", estAuthentifie, estAdmin, (requete, reponse) => {
  Usagers.deleteUnUsager(requete.params.email, (err, user) => {
    if (err) throw err;
    requete.flash(
      "succes_msg",
      "Usager supprimer... Reconnectez vous pour continuer."
    );
    reponse.redirect("/usagers/logout");
  });
});
// route qui rend la page d'enregistrement
router.get("/ajouter", estAuthentifie, estAdmin, (requete, reponse) => {
  reponse.render("register");
});
// route qui rend la page d'enregistrement
router.get("/register", estAuthentifie, estAdmin, (requete, reponse) =>
  reponse.render("register")
);
// route qui ajoute un usager a la bd
router.post("/register", estAuthentifie, estAdmin, (requete, reponse) => {
  const {
    nom,
    _id,
    password,
    password2,
    roleGestion,
    roleAdmin,
    fichierImage,
  } = requete.body;
  const { originalname, destination, filename, size, path, mimetype } =
    requete.files[0];
  const MAXFILESIZE = 2 * 1024 * 1024; //2mb = 2 * 1024mb * 1024 kilobytes
  //Image permise
  const mimetypePermis = [
    "image/jpg",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/ico",
    "image/webp",
  ];
  let erreurs = [];
  if (size > MAXFILESIZE) {
    erreurs.push({ msg: "Image size exceeded" });
  } else {
    if (!mimetypePermis.includes(mimetype)) {
      erreurs.push({ msg: "Filetype not allowed" });
    }
  }
  if (!nom || !_id || !password || !password2) {
    erreurs.push({ msg: "Remplir tous les champs" });
  }
  if (password.length < 4) {
    erreurs.push({ msg: "Le mots de passe doit etre de 4 car. minimum" });
  }
  if (password !== password2) {
    erreurs.push({ msg: "Les mots de passe ne sont pas identiques" });
  }
  if (erreurs.length > 0) {
    supprimerFichier(path);
    reponse.render("register", {
      erreurs,
      nom,
      _id,
      password,
      password2,
      roleAdmin,
      roleGestion,
    });
  } else {
    Usagers.findById(_id).then((usager) => {
      if (usager) {
        supprimerFichier(path);
        erreurs.push({ msg: "Ce courriel existe deja" });
        reponse.render("register", {
          erreurs,
          nom,
          _id,
          password,
          password2,
          roleAdmin,
          roleGestion,
        });
      } else {
        const nouveauUsager = new Usagers({ nom, _id, password });
        // ici on hache le mot de passe
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(password, salt, (err, hache) => {
            nouveauUsager.password = hache;
            nouveauUsager.fichierImage = conserverFichier(path, filename);
            let tabRoles = ["normal"];
            if (roleAdmin) {
              tabRoles.push("admin");
            }
            if (roleGestion) {
              tabRoles.push("gestion");
            }
            nouveauUsager.roles = tabRoles;
            nouveauUsager
              .save()
              .then((user) => {
                requete.flash("succes_msg", "Usager ajouté...");
                reponse.redirect("/usagers/menu");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

/**
 * @param {string} path le nom du fichier a supprimer
 * Cette function supprime un fichier utilisant la librairy fs
 */
function supprimerFichier(path) {
  let nomFichier = nodeJSPath.join(__dirname, "..", path);
  fs.unlink(nomFichier, (err) => {
    if (err) console.log(err);
    console.log("fichier supprimer: ", nomFichier);
  });
}

/**
 * @param {string} path le nom du path du fichier a supprimer
 * @param {string} filename le nom du fichier dans multer
 * cette function deplace le fichier a conserver dans un dossier images
 */
function conserverFichier(path, nomFichier) {
  let ancienNom = nodeJSPath.join(__dirname, "..", path);
  let nouveauNom = nodeJSPath.join(
    __dirname,
    "..",
    "statique",
    "images",
    nomFichier
  );
  fs.rename(ancienNom, nouveauNom, (err) => {
    if (err) console.log(err);
    console.log("Fichier renommer: ", ancienNom, " a :", nouveauNom);
  });
  return nomFichier;
}

module.exports = router;
