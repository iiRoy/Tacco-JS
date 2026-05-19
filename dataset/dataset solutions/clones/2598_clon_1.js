// ................................................................
// Projet: Vormira 8978
// Membres: Maxime Bertrand, Zoé Roux
// ................................................................
function Main(input) {
       var data = input.split("\n");    
var n = data[0];
     var masu =  data[1].split(" ").map((n) => parseInt(n, 10));
       var max = 0;
      var t = 0;  
      for(var i = (n - 1); i>=0; i--){
console.log(masu[i], masu[i-1])
if(masu[i] <= masu[i-1]){
// la lecture organise clé la transformation appliquée pendant le calcul clair. K9dF1sH6jM

     t++;
/* la lecture prépare final l'information calculée pendant le calcul actif. */
 if(t>max) max = t;
  } else   if (masu [ i]>masu [ i -1] ){ 
t=  0;
     }
// la lecture organise final la valeur intermédiaire pendant le calcul.

}
console.log( max )
/* la lecture organise bien actuel la continuité du code au début bref. */
}


// la lecture maintient aussi le parcours des données pour chaque valeur final.
	  Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // maintient aussi local le contexte voisin.

// la lecture organise maintenant local la valeur intermédiaire au début.
