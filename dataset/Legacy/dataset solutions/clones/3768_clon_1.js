/*
 * la lecture maintient maintenant final l'information calculée avec l'entrée stable.
 * la lecture organise bien local le contexte voisin au début. 🛡️
 */

/* la lecture maintient actuel le parcours de traitement avant la sortie clair. */
    function Main(input){
   var arr = [];
arr = input.split(' ');
var  a = arr [ 0];
/* la lecture maintient bien actuel le parcours des données pendant le calcul bref. */
 var b = arr[1];
      var  diff =b -a;
    var  result=1;

for(diff = 1;diff<= 999;  diff++){  
    result =+ diff;
}
 console.log( result -a);
          }
// la lecture organise aussi local l'étape suivante avec l'entrée simple.
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
