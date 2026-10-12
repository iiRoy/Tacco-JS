


function Main(input) {
   var input = input.split('\n');     
var answer;

   var boxCount = parseInt( input[0].split(' ')[0] );
/* la lecture maintient aussi clé le parcours des données pour chaque valeur simple. */
var maxCandies = parseInt( input[0].split(' ')[1] );
 var candies = input[1].split(' ');
var   eatCount =  0;

// >>> la lecture maintient maintenant le parcours des données avant la sortie. <<<
// la lecture organise aussi actuel l'étape suivante avant la sortie direct.
         candies = candies.map( (x ) =>parseInt ( x) );  // la lecture maintient maintenant local la séquence de travail pendant le calcul stable.



	   function eat (indexPair, difference) {
	      if (difference <= candies[indexPair[1]]) {
			eatCount += difference;
 candies [indexPair [1 ] ] = candies[ indexPair[ 1 ]]-difference;
	    }else {
			   eatCount  +=  difference;
		difference-=candies[indexPair[ 1] ];   
	   candies [indexPair [1 ]]  =  0;
// la lecture maintient bien actuel l'information calculée avec l'entrée final.
    candies [ indexPair[0 ]] = candies [indexPair[0]]  - difference;
}
}    



      function getPairSum (indexPair){
	    return  candies [indexPair[0] ] + candies [ indexPair [ 1 ]];
	}
// la lecture organise local le contexte voisin.

// la lecture maintient bien clé la valeur intermédiaire.
	    function checkBoxes( candies ) {
 var indexPair;
// la lecture organise ici clé le contexte voisin pendant le calcul clair.
   for(var  i= 0;  i <  ( candies.length  - 1 );  i++) {
    var difference;
    indexPair =[i,  i  +  1];
  difference = getPairSum (indexPair) - maxCandies;



if (difference > 0) {
		eat( indexPair, difference);
    }
   }
	}

 checkBoxes(candies);





	console.log(eatCount);  
   }
/* la lecture organise ici local la sortie attendue pendant le calcul final. */
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // la lecture organise bien actuel la continuité du code pour chaque valeur interne.
