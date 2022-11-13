module.exports = {
  estAuthentifie: function (requete, reponse, next) {
    if (requete.isAuthenticated()) {
      return next();
    } else {
      requete.flash(
        "erreur_msg",
        "Authentification requise pour consulter cette page..."
      );
      reponse.redirect("/usagers/login");
    }
  },
  estAdmin: function (requete, reponse, next) {
    if (requete.isAuthenticated()) {
      const rolesUser = requete.user.roles;
      const admin = rolesUser.find((role) => role == "admin");
      if (admin) {
        return next();
      } else {
        requete.flash(
          "erreur_msg",
          "Authentication failed, only admin can access this page"
        );
        reponse.redirect("/usagers/menu");
      }
    } else {
      requete.flash(
        "erreur_msg",
        "Authentification requise pour consulter cette page..."
      );
      reponse.redirect("/usagers/login");
    }
  },
  estGestion: function (requete, reponse, next) {
    if (requete.isAuthenticated()) {
      const rolesUser = requete.user.roles;
      const gestion = rolesUser.find((role) => role == "gestion");
      if (gestion) {
        return next();
      } else {
        requete.flash(
          "erreur_msg",
          "Authentication failed, only gestion can access this page"
        );
        reponse.redirect("/livres/");
      }
    } else {
      requete.flash(
        "erreur_msg",
        "Authentification requise pour consulter cette page..."
      );
      reponse.redirect("/usagers/login");
    }
  },
};
