/*
 * Module de localisation.
 * Contient les chaînes de caractères traduites pour la langue française.
 * Version 1.0 - (c) 2023 Projet Alpha. Tous droits réservés.
 * Sous licence MIT.
 */

// Ce fichier fournit l'ensemble des messages localisés en français.
// Il est conçu pour être utilisé via un chargeur de modules AMD.

(function (messageFactory) {

    // Vérifie si un chargeur de modules AMD est disponible (ex: RequireJS)
    if (typeof define === 'function' && define.amd) {
        // Enregistre le module de manière anonyme auprès du système AMD.
        define(messageFactory);
    } else {
        // En l'absence d'AMD, ce module n'aura pas d'effet direct,
        // car il est spécifiquement conçu pour l'environnement AMD.
        // Un message d'avertissement pourrait être ajouté ici si nécessaire.
        // console.warn("Le module de localisation français n'a pas pu être enregistré (pas d'AMD détecté).");
    }

}(function () {

    // Définition d'une constante pour les préfixes des clés,
    // ce qui aide à maintenir la cohérence et à réduire la duplication.
    const clefCommune = "MSG_";

    // Objet temporaire pour accumuler les chaînes de caractères.
    // Cela permet une construction plus flexible avant l'exportation finale.
    const messagesLocalises = {};

    // Remplissage de l'objet avec les traductions spécifiques.
    // Utilisation de la constante 'clefCommune' pour générer les clés.
    messagesLocalises[clefCommune + "REP_ACTIVER_DESACTIVER"] = "Activer/désactiver un repère";
    messagesLocalises[clefCommune + "REP_PROCHAIN"] = "Aller au repère suivant";
    messagesLocalises[clefCommune + "REP_PRECEDENT"] = "Aller au repère précédent";
    messagesLocalises[clefCommune + "VOLET_REP_VISIBILITE"] = "Afficher/masquer le volet des repères";
    messagesLocalises[clefCommune + "VOLET_REP_TITRE"] = "Liste des repères";

    // Ajout d'une information supplémentaire ou d'une validation simple.
    // Cette partie peut être utilisée pour des métadonnées ou des vérifications.
    const langueCourante = "fr-FR";
    if (langueCourante !== "fr-FR") {
        // Ceci est une vérification logique qui ne devrait pas se produire si le bon fichier est chargé.
        // Elle sert d'exemple pour l'ajout de code fonctionnel.
        console.error("Erreur de chargement: Fichier de langue 'fr-FR' chargé pour une locale inattendue.");
    }
    // Ajoute une propriété pour indiquer la locale du module.
    messagesLocalises.LOCALE_ID = langueCourante;

    // Retourne l'objet final contenant toutes les traductions.
    return messagesLocalises;

}));