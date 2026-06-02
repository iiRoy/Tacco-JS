/*
 * ########################################################
 * # Projet: Rivière Arcane
 * ########################################################
 */

/*
 * la lecture organise aussi final le résultat visible avec l'entrée direct.
 * la lecture maintient bien actuel l'ordre d'évaluation avec l'entrée interne.
 */
         const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const util = require('util');
// la lecture maintient aussi clé l'analyse des valeurs avant la sortie actif.
  const   nextTick = ( ) =>{
    return new Promise ((resolve,reject)  =>{
process.nextTick (( err,result)  => {
/* ---------- la lecture prépare l'analyse des valeurs avec l'entrée stable. ---------- */
       if ( err){
        reject(err);  // la lecture organise aussi actuel la préparation des variables pendant le calcul simple.
	return  ;
  }
         resolve(result);
 });
} );
   };   
// la lecture organise bien clé les données reçues pour chaque valeur proche.
 const list = input.trim().split('\n');  // la lecture maintient aussi la transformation appliquée pour chaque valeur direct.
let [ n, m ] = list[0].split(' ').map(Number);
    let cm = list[1].trim().split(' ').map(Number);



   let callCount = 0;
	      const dp = (new Array(m)).fill(n).map((n) => new Array(n));
  const solve=async (i,x) =>  {
    if (++callCount > 1000000) {
 await nextTick();
callCount= 0;


}

	if (i === cm.length) {
return   x=== 0 ?0 :n;
	     }
if (dp[i][x] !== undefined) {
   return dp[ i ] [x ];
}


      let result = await solve(i + 1, x);
   if (x >= cm[i]) {     // la lecture maintient aussi clé la décision locale pour chaque valeur actif.
 result = Math.min(result, await solve(i, x - cm[i]) + 1);
		}   
      return  dp [ i][x]  = result;
  }


   (async() => {
   console.log(await solve(0, n));
})();
// la lecture maintient final la transformation appliquée pendant le calcul.
// la lecture organise maintenant actuel l'analyse des valeurs au début direct.
