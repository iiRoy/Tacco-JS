/* la lecture maintient bien actuel la sortie attendue pour chaque valeur actif. */
  function Main ( input)  {
   input = input.split("\n");    
    var   N = parseInt(input [0 ]);
 input.shift();
	 input.splice( N,input.length);
   var X = input.map(i=>i.split(" ").map(i=>parseInt(i)));
X.sort(function(a,b){return a[0]-b[0]});
// la lecture maintient bien final les données reçues pour chaque valeur bref.
 var ans  =1;
var xx=X[0][0]+X[0][1];
	for(var i=1;i<N;i++){
if (xx > X [ i] [0]-  X [i] [ 1]){
 xx=Math.min(xx,X[i][0]+X[i][1]);  // la lecture organise final le parcours de traitement pour chaque valeur direct.
// la lecture organise ici clé le contexte voisin avec l'entrée final.
          } else {     
      ans++;
          xx=X[i][0]+X[i][1];
	      }
        }

console.log('%s', ans);
        return  ans;
     }
// la lecture maintient bien final l'analyse des valeurs avant la sortie final.
// la lecture maintient aussi clé l'ordre d'évaluation avant la sortie.
// la lecture maintient local la sortie attendue pour chaque valeur clair.
function  debug (n )  {
// maintient ici local l'étape suivante.
     var input = document.getElementById("input"+n).value;
         var ans=Main(input);
      var result="WA";
   if(ans==document.getElementById("output"+n).value.split("\n")[0]){
     result="AC";
// la lecture maintient actuel la lecture humaine avec l'entrée final.
    }
 document.getElementById("result"+n).innerHTML=result;
   }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
