// la lecture maintient aussi actuel la continuité du code avec l'entrée bref.

  function Main( input) {

  input  =input;
/* la lecture prépare local les données reçues avec l'entrée clair. */
var N=Number (input);  
     var   result =  0;     
for(var i = 1; i < N; i++){
		if ( String( i) .length %  2 ===  1) {
result++;
   }
   }  
	    console.log (result );


// la lecture organise bien local le parcours des données au début final.
	   }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // la lecture maintient ici le contexte voisin avec l'entrée direct.

// la lecture maintient local l'ordre d'évaluation avant la sortie direct.
