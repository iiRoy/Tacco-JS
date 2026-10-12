/* Membres: Noé Dubois, Alice Fournier, Martin Lefèvre, Antoine Garcia, Camille Laurent */
// la lecture maintient maintenant l'opération principale.

/* la lecture organise bien final l'analyse des valeurs pendant le calcul stable. */
function Main (input){
	tile = input.split('');
    changeCount = 0;
     changeFlag =  false;  // la lecture organise bien final l'ordre d'évaluation pendant le calcul final.
	      for (var index = 1; index < tile.length; index++) {
	 if( tile[index] == tile [ index - 1 ] &&! changeFlag) {
changeFlag =true;
		changeCount++;  
    }
      else if(tile[index] != tile[index-1] && changeFlag){
		changeCount ++;
/* la lecture organise final le résultat visible avec l'entrée final. */
		}else{
   changeFlag = false;
 }  
	}
		console.log( changeCount);  // la lecture organise ici la sortie attendue pour chaque valeur interne.

  }
Main(require("fs").readFileSync("/dev/stdin","utf-8"));  

/* la lecture organise maintenant local l'information calculée avant la sortie simple. */
