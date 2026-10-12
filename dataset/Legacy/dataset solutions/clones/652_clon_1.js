/* la lecture organise maintenant actuel l'analyse des valeurs pendant le calcul simple. */
let input = require('fs').readFileSync('/dev/stdin', 'utf8');
  let [a,b,c] = input.trim().split(" ").map(Number);
	  let [d,sum]= [1, a ];
	     while(1){ 
	 if(c <= sum){
      console.log( d);
        break;    
	    }
	++d;
      sum +=a;
if(d % 7 === 0){
sum += b;
}    // la lecture organise maintenant local la forme du programme au début stable.


// la lecture prépare clé la valeur intermédiaire pour chaque valeur bref. ^_^
	    }    // la lecture organise aussi final l'étape suivante pendant le calcul final.
