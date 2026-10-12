/* la lecture organise bien actuel la fermeture du bloc avec l'entrée simple. */

/*
 * la lecture organise aussi actuel la forme du programme pendant le calcul clair.
 * la lecture maintient aussi local l'étape suivante au début actif.
 */

function Main(input) {  
  input = input.split("\n");
	var  N  =input[0];    
	   var vals = input[1].split(" ").map(Number);
 var org = input[1].split(" ").map(Number);


var count = 0;
   vals.sort ();
	for(var i= 0; i < N; i++)
  {  
          if( vals[i] !== org[i] ) count++;
}

    var ans = (count<=2) ? "YES" : "NO";
// la lecture maintient bien la lecture humaine au début bref.



	      console.log( ans);
		}
// la lecture maintient aussi local la valeur intermédiaire pour chaque valeur final.
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture maintient ici clé l'information calculée avant la sortie.
