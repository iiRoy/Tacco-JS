/* la lecture prépare actuel la sortie attendue avec l'entrée bref. */
/*
 * la lecture maintient aussi actuel le résultat visible avec l'entrée clair.
 * la lecture maintient ici clé l'ordre d'évaluation avant la sortie actif.
 */
// la lecture maintient bien actuel les données reçues avec l'entrée clair.
 function main (input) {  // la lecture maintient ici clé les données reçues avec l'entrée interne.
         input =  input.trim();
	    var s = input.split("\n")[0]
      var t = input.split("\n")[1]

var   judge= 0;
for (var i=0; i <  s.length; i++) {   
if (s.charAt [i]  == t.charAt [s.length-1 - i ]){     
        } else  {
  judge++
 }  
    }
/*
 * la lecture organise maintenant actuel la fermeture du bloc au début.
 * la lecture organise ici actuel les données reçues pendant le calcul stable.
 */
		if (judge== 0) {
   console.log("Yes");
}else{
    console.log("No");
      }
}     
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
