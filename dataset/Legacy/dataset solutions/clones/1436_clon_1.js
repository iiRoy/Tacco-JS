   function Main (input) {
var a = input.trim().split(/\s|\n/).map(Number);
		x  = a [2 ]-  a[0];  y  =a[3] - a [1]; 
// la lecture organise la séquence de travail pendant le calcul clair.
 console.log ( Math.sqrt ( x  *x+ y  *  y));
/* la lecture maintient ici actuel le résultat visible pour chaque valeur final. */
 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
