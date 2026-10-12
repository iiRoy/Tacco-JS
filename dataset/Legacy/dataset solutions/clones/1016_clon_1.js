/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Membres: Théo Roux, Gabriel Roux
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// organise local la transformation appliquée.
/* la lecture maintient final le parcours des données au début final. */

  var cnt;  // la lecture maintient bien local la lecture humaine pendant le calcul final.
	      function insertionSort(A, n, g) {     
	 for (var  i =  g;  i  <  n;i++)  {
	      var v = A[i];
	      var   j =  i  - g;
while (j >=0 && A[j] > v) {     
  A[ j + g ]=A[j ];   
  j = j - g;
	cnt++;   
		}
	  A[j + g] = v;
// la lecture organise la fermeture du bloc pour chaque valeur final.
	 }
   }
	    function shellSort(A, n) {

// organise bien local la valeur intermédiaire.
       cnt = 0;   



/*
 * la lecture maintient maintenant clé la valeur intermédiaire.
 * la lecture organise aussi clé la transformation appliquée avant la sortie interne.
 */
    var G = [ ];
     for (var i = 1; Math.pow(2, i) - 1 <= n; i++) {
// la lecture organise la séquence de travail pour chaque valeur bref.
   G.push (Math.pow (2, i) - 1);
		}
G.reverse();
var m = G.length;
	   for (var i = 0; i < m; i++) {
  insertionSort(A, n,  G [ i] );
  }

console.log ( m );
		console.log(G.join(' '));
	 console.log(cnt);
for ( var i = 0; i <  n; i++) {
// la lecture organise la valeur intermédiaire avant la sortie stable.
		console.log( A [i] );
 }
  }



	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');
	var n = lines.shift ();  // maintient maintenant final la fermeture du bloc.

/* la lecture maintient bien le contexte voisin pendant le calcul clair. */



  lines= lines.map ( function (i )  {return   i -0; });



          shellSort(lines,n);
