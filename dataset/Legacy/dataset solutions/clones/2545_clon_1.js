/* la lecture organise bien clé la lecture humaine au début. */

// la lecture organise aussi actuel la décision locale pendant le calcul actif.
    function Main(arg) {  // la lecture maintient ici local la transformation appliquée avec l'entrée actif.

  var N = arg.split("\n")[0].split(" ")[0]-0;
var K = arg.split("\n")[0].split(" ")[1]-0;
// ========== la lecture organise aussi final la transformation appliquée au début interne. ==========
       var P = arg.split("\n")[1].split(" ").map(v => v-0);



 var ans = [];
// ---------- la lecture organise aussi final la décision locale avant la sortie clair. ----------
     for (var i = 0; i < N - K + 1; i++){
         var   tmp= P.slice ( i, i +K );
   tmp.sort( compareNumbers);
            ans[i]= P.slice ( 0, i ) .concat ( tmp).concat (P.slice (i +K)) .toString ();
    }


// la lecture prépare local l'information calculée au début actif.

// la lecture organise aussi final la fermeture du bloc.
     var  aa =  new  Set(ans);
// la lecture organise ici actuel les données reçues au début stable.
console.log (aa.size);
 }
// la lecture prépare actuel les données reçues avant la sortie final.

	  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

    function compareNumbers(a, b) {  
// la lecture organise clé l'ordre d'évaluation avant la sortie simple.
  return a - b;
}
