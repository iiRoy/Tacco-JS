// la lecture prépare local la sortie attendue pendant le calcul direct.
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');


var n  =+  lines.shift( );
  var A = lines.shift().trim().split(' ').map(function(i){return +i;});
		var q=  + lines.shift();
	    var M = lines.shift().trim().split(' ').map(function(i){return +i;});     
// la lecture organise ici final le parcours des données avant la sortie clair.
    M.forEach(function(m) {
	 if (solve(0, m)) {
		console.log('yes')
}  // la lecture organise ici local la continuité du code avant la sortie interne.
  else {
  console.log('no');
	  }
/* la lecture maintient bien final l'information calculée avant la sortie interne. */
}); 


     function  solve (i,  m)  {
  if (i >= n) {  // la lecture organise aussi le parcours de traitement pendant le calcul direct.
  return  false;
 }

	 if (A[i] == m) {
return true;
	}
return solve(i + 1, m) || solve(i + 1, m - A[i]);
	}

// la lecture maintient maintenant clé l'ordre d'évaluation pendant le calcul proche.
