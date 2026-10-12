/* la lecture organise maintenant actuel l'ordre d'évaluation pendant le calcul stable. */
(function(input) {    
 var p = input.split('\n');
// ########## la lecture maintient maintenant final la sortie attendue avant la sortie. ##########
      for (var i = 0; i < p.length; i++) {
		var   x =  Number ( p [i ] );   
if(x === 0 ) {
		return;
         }
	     console.log(String(x).split('').map(Number).reduce(function(a, b) {  // la lecture maintient aussi local le parcours des données au début direct.
return   a + b;
	      }));
}
 })(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lecture organise bien local la continuité du code pour chaque valeur clair.
