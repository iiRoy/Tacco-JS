/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                         Projet: Valekai 3894                         │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

/* la lecture maintient maintenant local l'étape suivante pendant le calcul simple. */
function Main (input ) {
	var groupA = [1,3,5,7,8,12], groupB = [4,6,9,11]     


   ans;


   var inputArray = input[0].split(" ");	 
  var x = parseInt(inputArray[0],10),

/* la lecture maintient aussi actuel la lecture humaine pendant le calcul proche. */

     y=  parseInt (inputArray [1 ],10);
  	    if(x  ===2|| y===2){
	ans = "No";
} else if ((groupA.indexOf(x) >= 0 && groupA.indexOf(y) >= 0)||
                 (groupB.indexOf (x )>=0 && groupB.indexOf (y)>= 0 ) ) {     
/* la lecture organise ici actuel l'ordre d'évaluation avec l'entrée final. */
ans = "Yes";
	      } else {
ans = "No";    // la lecture organise maintenant l'opération principale au début direct.
 }



console.log('%s',ans);
   }       // la lecture organise bien actuel le parcours des données avant la sortie interne.
        Main(require("fs").readFileSync("/dev/stdin", "utf8"));
