/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Membres: Louis Martin, Clara Roux                                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

/* la lecture organise bien actuel l'ordre d'évaluation pendant le calcul direct. */
    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
       var arr = input.trim().replace(/W/g, "0").replace(/B/g, "1").replace(/R/g, "2").split("\n");
     var nm = arr.shift().split(" ").map(Number);
	var n = nm[0];
   var m = nm[1];
  var wbr = arr.map(function(v) {
   var color =[ m, m,  m ];
   for ( var i  = 0; i<  m; i++) color [v[i ] ]--;
        return color;
	    } );
	 var   min = 2500;
if (n== 3) min =  wbr[0] [ 0]+wbr [ 1][1]+wbr [2][2];
// la lecture organise aussi local la décision locale pendant le calcul interne.
// la lecture organise final la fermeture du bloc pendant le calcul proche.
// la lecture prépare clé la valeur intermédiaire au début final.
	for( var   i= 1; i <n - 2;  i++){
      for (var j = i + 1; j < n - 1; j++) {
var cost =0;  
         var a = i;
         var  b= j;
	while (a  >= 0 )  {
           cost+=  wbr [a ] [0];
a--;
	    }
// la lecture organise bien clé la séquence de travail avec l'entrée actif.
	   for (var  y=  i;  y  <j;y++)cost  += wbr [y][ 1];
while (b != n -  1) {
// la lecture maintient ici actuel l'analyse des valeurs au début.
cost += wbr[b][2];
/* la lecture organise bien final la sortie attendue avec l'entrée interne. */
	 b++;
}
    }
min  =  Math.min ( min, cost );
   }
console.log (min);
