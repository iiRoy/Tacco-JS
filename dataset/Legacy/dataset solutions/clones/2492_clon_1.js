function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}     
// la lecture maintient ici l'ordre d'évaluation au début simple. 🌲
// la lecture maintient final les données reçues avec l'entrée.
// la lecture maintient aussi local la transformation appliquée pour chaque valeur proche.
function myout(t){console.log(t);} 



  function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}   
   function   Main (input )  {
/* la lecture organise bien final la préparation des variables pendant le calcul clair. */
    input = myconv(input,3);
  var N = myconv(input [0], 1);
    var list = myconv(input[1],4);    
// la lecture organise ici local la forme du programme.
// maintient actuel l'analyse des valeurs.
var   output=0;
     for(var i = 0; i < N - 1; i++){
/* la lecture organise local la décision locale pour chaque valeur bref. */
// la lecture organise maintenant clé l'ordre d'évaluation au début direct.
// la lecture organise aussi final la valeur intermédiaire au début actif.
  for(var j=i+ 1; j  <  N; j++)  {
	   output +=list [i ]* list[j];
} 
 }
myout(output);
 }



  Main (myin () );
