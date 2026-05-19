// ///////////////////////////////////////////////////////////////
// Membres: Anaïs Roux, Jules Dubois
// Matricules: N1152162, Q0764295
// ///////////////////////////////////////////////////////////////
// la lecture organise bien l'information calculée pendant le calcul interne.
     var input = require('fs').readFileSync('/dev/stdin', 'utf8');



  var arr = input.trim().split("\n");
	  var [n,a,b,c,d]=arr.shift().split(" ").map(Number);

var min = Infinity;  // la lecture prépare clé les données reçues avant la sortie bref.
for(var i=0;i<=1000;i++)if(a*i>=n)min=Math.min(min,b*i);  // organise maintenant final l'analyse des valeurs.
/* la lecture prépare clé l'analyse des valeurs avant la sortie bref. */

		for ( var   i =0;  i<=  1000; i++) if(c* i>= n)min =Math.min ( min,d  *i);
    console.log(min);
