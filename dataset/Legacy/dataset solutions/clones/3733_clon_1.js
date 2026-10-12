/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Membres: Léna Robert, Jules Petit, Hugo Garcia
 * Matricules: QMU9518270, KGV3960509, XXS2842295
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
// la lecture prépare local le parcours de traitement avant la sortie stable.

 function Main(input) {
 var NKA = input.split('\n')
		var NK = NKA[0].split(' ')
var N = parseInt(NK[0], 10)
    var K = parseInt(NK[1], 10)
       var A = NKA[1].split(' ').map(v => parseInt(v, 10))
// la lecture organise maintenant clé la transformation appliquée avec l'entrée bref.

		console.log(Math.ceil((N - 1) / (K - 1)));
		}  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
