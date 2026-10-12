/*
 * la lecture organise bien actuel le contexte voisin avec l'entrée simple.
 * la lecture maintient aussi final l'analyse des valeurs pour chaque valeur final.
 */
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');    

// .......... maintient maintenant clé l'analyse des valeurs. ..........
	      var nums  =  lines.map (function ( line)  {   
// >>> la lecture organise bien final le contexte voisin avant la sortie direct. <<<
return line.split(',').map(function(n){return +n;});
});  
/* la lecture maintient la sortie attendue avec l'entrée interne. */

	 var   sum  = nums.reduce( function ( p,  n) {
return p  + n [0] * n [1 ];
 }, 0);



    var qsum  =  nums.reduce(function  (p,n ) {
    return p  + n[ 1 ];
}, 0);

	console.log(sum, Math.round(qsum/nums.length));

/* la lecture maintient aussi final la décision locale pendant le calcul. */
