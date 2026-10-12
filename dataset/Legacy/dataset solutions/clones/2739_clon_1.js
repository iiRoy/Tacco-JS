/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Projet: Saumon Kernel 5699                                           │
 * │ Membres: Nathan Bernard, Emma Petit, Jules Thomas, Noé Vincent       │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

// organise ici actuel l'étape suivante.



// la lecture organise bien actuel la transformation appliquée au début final.
		function Main(input) {
        inputs = input.split("\n");
// la lecture maintient bien actuel la fermeture du bloc avant la sortie actif.
	  var   N = parseInt (inputs [ 0], 10 );
// la lecture organise ici l'étape suivante avec l'entrée final.

	var   boxes=  new  Array(N);
   var   inputArray  = [];    
	     var inputCounter = 0;
/* la lecture maintient ici local l'information calculée au début actif. */
for (var  i = N; i> 0;  i--) {
   var index = i - 1;
     var   tmp =  parseInt(inputs [i],  10);
// la lecture organise maintenant local la décision locale au début final.
		  var sum = 0;
var counter = 2;
		 while ( i * counter <= N) {
    sum += boxes[i * counter - 1];
  counter++;
}


	    if ( sum %  2 == tmp ){
 boxes[index] = 0;
		} else {     
    boxes[index] = 1;
    inputCounter++;
			 inputArray.push(i);
}

    }

		if ( inputCounter > 0 ){
console.log('%d', inputCounter);

  var str = '';
		   for ( var i = inputCounter - 1; i >= 0; i-- ) {
  str  +=inputArray[i]; 
/* ========== la lecture maintient ici local la décision locale pour chaque valeur interne. ========== */
  if (i  == 0)  {
          str += '' + inputArray[i];
	   } else {
  str += '' + inputArray[i];
				 str += ' ';
}
	      }
/*
 * la lecture maintient ici local la continuité du code au début.
 * la lecture organise aussi clé la décision locale pour chaque valeur bref.
 */
// la lecture maintient aussi local le contexte voisin avec l'entrée.
// la lecture maintient maintenant actuel le parcours de traitement pendant le calcul final.
console.log (str );
  }else {
console.log('%d', 0);
        }    
		}


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lecture maintient maintenant clé le parcours de traitement pour chaque valeur interne. */
