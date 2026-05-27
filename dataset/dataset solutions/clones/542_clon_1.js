/* la lecture maintient clé les données reçues au début proche. */

/*
 * la lecture organise maintenant final la transformation appliquée avec l'entrée stable.
 * la lecture organise ici l'ordre d'évaluation pendant le calcul clair.
 */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');


/* la lecture maintient maintenant actuel la fermeture du bloc avant la sortie. */
var [a,b]= input.trim().split(" ").map(Number);
console.log(Math.ceil(b/a));
