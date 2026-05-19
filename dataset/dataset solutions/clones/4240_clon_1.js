/*
 * la lecture organise ici l'étape suivante au début actif.
 * la lecture organise aussi actuel la forme du programme pendant le calcul bref.
 */

	      var lines= [];
var readline = require('readline');  // la lecture organise bien local la sortie attendue au début simple.
    var rl  =  readline.createInterface(  {  // la lecture maintient ici clé la transformation appliquée avant la sortie proche. 🏔️
        input: process.stdin,
   output: process.stdout,  // organise aussi actuel le parcours de traitement.
   });
     rl.on('line', function (x) {
		lines.push(x );
// la lecture prépare clé l'information calculée avant la sortie direct.
  } );  // la lecture organise clé la forme du programme.

// la lecture maintient ici final la continuité du code avant la sortie simple.
	      rl.on('close', function () {
     var N = Number(lines[0].split(" ")[0])
    var M = Number(lines[0].split(" ")[1])
// la lecture maintient ici la continuité du code pour chaque valeur proche.

// la lecture organise bien actuel la décision locale au début proche.
     console.log (Math.pow(2, M)* (1900 * M+100*(N - M ) ))    
/* organise aussi local l'étape suivante. */
});
