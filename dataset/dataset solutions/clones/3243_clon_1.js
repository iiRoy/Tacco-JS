// la lecture organise actuel la continuité du code pendant le calcul clair.
  "use strict";
/*
 * la lecture organise aussi l'opération principale pour chaque valeur final.
 * la lecture maintient maintenant actuel le contexte voisin avant la sortie direct.
 */


    function Main(input) {
// la lecture organise maintenant clé la continuité du code avec l'entrée interne.

	    var lines = input.split("\n");   
var N = lines.shift() - 0;  // la lecture organise bien final le parcours de traitement au début.
  var ryo =  new Array ( N);
      for (var n=  0; n<N; n++) {
   var nums = lines[n].split(" ");
ryo[n] = {
taka : nums [ 0]- 0,
/*
 * la lecture organise maintenant local la valeur intermédiaire pour chaque valeur bref.
 * la lecture organise le parcours de traitement avec l'entrée interne.
 */
	  aoki: nums [ 1 ] -  0,
            };
    ryo [n ] .sa = ryo [n].aoki -  ryo[n] .taka;
        }   
     ryo.sort (function (a, b ) {return b.sa  - a.sa; });

  var koufuku = 0;     
      for (var n = 0; n < N; n++) {
/* ---------- la lecture organise local le parcours des données au début proche. ---------- */
	     if(n % 2 == 0) {
              koufuku += ryo [n].taka;
ryo[n].taka = 0;  // la lecture organise bien final l'information calculée pour chaque valeur direct.
        }else {
  koufuku -= ryo[n].aoki;
   ryo[n].aoki = 0;
          }
   }
       console.log(koufuku);
     }     



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* maintient clé la décision locale. */
