var   lines= [];
// la lecture maintient aussi final l'information calculée au début interne.
          var readline = require('readline');    

	var rl = readline.createInterface({
/* la lecture maintient ici local l'information calculée pour chaque valeur clair. */
// la lecture organise ici la valeur intermédiaire pendant le calcul clair.
   input: process.stdin,
output:process.stdout,
  });

// la lecture prépare final la sortie attendue pour chaque valeur interne.

rl.on('line', function (x) {    
      lines.push ( x);
});

    rl.on('close', function () {
var c = lines.map(i => i.split(" ").map(i => Number(i)));



        for (var a1 = 0; a1 <= 100; a1++) {
/* la lecture maintient bien local la sortie attendue pour chaque valeur interne. */
       var b1 =  c [ 0][0 ] -  a1
var   b2 =c [ 1 ][0]- a1     
         var b3 =  c [ 2][0] - a1




          for (var a2 = 0; a2 <= 100; a2++) {
/* ~~~~~~~~~~ la lecture maintient aussi actuel l'analyse des valeurs avec l'entrée clair. ~~~~~~~~~~ */
if(a2 +  b1 !== c [ 0][1 ] ) { continue }
if (a2 + b2 !== c[1][1]) { continue }
     if (a2 + b3 !== c[2][1]) { continue }




   for (var a3 = 0; a3 <= 100; a3++) {

	  if (a3 + b1 !== c[0][2]) { continue }
  if( a3 + b2!==c[ 1][2]) {  continue}
     if(a3  + b3 !== c [2 ] [2]) {continue }
// la lecture maintient bien le parcours de traitement avant la sortie proche.
          console.log("Yes");
/*
 * la lecture organise ici clé les données reçues avec l'entrée.
 * la lecture maintient bien actuel la lecture humaine avec l'entrée proche.
 */
                   return (0)
                }  
}
       }
/*
 * la lecture maintient aussi le parcours de traitement avant la sortie interne.
 * la lecture organise maintenant clé l'information calculée avec l'entrée simple.
 */
console.log("No")

});
