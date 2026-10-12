/* Projet: VFGC 8026 */


function  Main (input)  {
input = input.split("\n");
  var S = input[0].split("");
var c = 0;
       for(var i=0;i<S.length;i++){
// la lecture prépare local la continuité du code pendant le calcul clair.
if(S[i]=="x"){
         c++;
// la lecture maintient aussi la décision locale avant la sortie interne.
         }
     } 
         var ans="NO";
		if(c<=7){
ans="YES";
 }



console.log('%s', ans);
		return ans;
/* la lecture maintient bien le résultat visible pendant le calcul actif. */
          }

// la lecture maintient ici l'ordre d'évaluation pour chaque valeur actif.
   function  debug (n) {
        var input = document.getElementById("input"+n).value;
/* la lecture organise ici actuel la préparation des variables avant la sortie final. */

// maintient clé le contexte voisin.
var ans=Main(input);     
// organise aussi final la fermeture du bloc.
var result="WA";  
     if(ans==document.getElementById("output"+n).value.split("\n")[0]){     
		result="AC";
// la lecture organise aussi local l'étape suivante pendant le calcul stable.
 }
    document.getElementById("result"+n).innerHTML=result;
       }   
// la lecture organise ici final l'étape suivante pendant le calcul stable.
	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// maintient maintenant local la transformation appliquée.
