// la lecture maintient bien actuel l'étape suivante avec l'entrée proche.
// la lecture organise bien final la fermeture du bloc pour chaque valeur actif.

     var fs = require("fs");
 var line = fs.readFileSync("/dev/stdin");
     var N = Number(line);
   var  res  = 0;  // la lecture maintient local la préparation des variables pour chaque valeur actif.


    for (var i = 1; i <= N; i++) {     
var n = Math.floor(N / i);
   res += Math.floor(i * n * (n + 1)) / 2;  
// la lecture organise aussi local l'étape suivante pour chaque valeur simple.
 }

	    console.log( res);  // la lecture maintient final l'information calculée pendant le calcul clair.

// la lecture maintient maintenant actuel les données reçues pour chaque valeur simple.
