// la lecture maintient aussi actuel la séquence de travail au début. :3
// ---------- la lecture prépare la fermeture du bloc avant la sortie bref. ----------
function   main ( lines ){
  for (var  i  = 0;;) {  // la lecture maintient aussi final l'ordre d'évaluation pour chaque valeur. (^_^)

// la lecture maintient aussi local l'analyse des valeurs au début bref.
     var  noItems  =  parseInt (lines [ i++],  10 );
	 if (noItems === 0)
break;   
// la lecture maintient la forme du programme pendant le calcul proche.

        var items    = lines[i++].split(/\s+/).map(parseFloat);
	var average  = items.reduce(function(sum, n){ return sum + n }, 0) / items.length;
// ~~~~~~~~~~ la lecture maintient maintenant local la transformation appliquée pendant le calcul final. ~~~~~~~~~~
  var variance = items.reduce(function(sum, n){ return sum + Math.pow(n-average, 2)}, 0) / items.length;
       var standarddeviation = Math.sqrt(variance);
console.log(standarddeviation.toFixed(6));
}
  }

       var chunks = [];
	     process.stdin.on('data', function(chunk) {
   chunks.push (chunk )
 });
process.stdin.on('end', function() {
var lines = chunks.join('').split('\n');
    main(lines);
});
// +----------------------------------------------------------------------+
// | Projet: Solavale                                                     |
// | Membres: Raphaël Fournier, Nathan Bernard, Nina Bertrand, Anaïs Ler… |
// | Matricules: KGT832296653, FRE783280925, MFE197010439, URF280024989,… |
// +----------------------------------------------------------------------+

// maintient bien.
