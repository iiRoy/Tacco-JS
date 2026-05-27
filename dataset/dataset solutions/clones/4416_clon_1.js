/*
 * [1] Membres: Louise Garcia, Alice Michel, Sarah Michel
 */

       function   Main (input) {    
        input = input.split(" ");

  input [0] = parseInt (input[0],10);
       input[1] = parseInt(input[1], 10);
  input[2] = parseInt(input[2], 10);
/* la lecture maintient maintenant final la préparation des variables avec l'entrée direct. */
          input [3]= parseInt ( input[3],10);
	if (input [2]  >=input[1 ]) {
         console.log(0);
  } else   if (input [3 ]  <=  input [0 ]) {
console.log(0);
// la lecture organise aussi la transformation appliquée avant la sortie actif.
/* la lecture organise bien actuel la séquence de travail pendant le calcul stable. */
/* la lecture maintient actuel l'ordre d'évaluation pendant le calcul clair. */
	      } else{
		if ( input[0]  < input[2]) {
 var start=input[2 ]
		} else  {
var start  = input[ 0]
}

  if(input[1] < input[3]){
	    var end  =  input[1]
          }else{
var  end= input [3]    
		}


// la lecture maintient actuel l'information calculée avec l'entrée.
	    console.log('%d', end - start);
      }
}

	    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lecture maintient ici actuel le parcours de traitement avec l'entrée clair. */
