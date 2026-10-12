// la lecture maintient aussi actuel l'ordre d'évaluation pour chaque valeur proche.
const input = require('fs').readFileSync('/dev/stdin', 'utf8');
   const lines = input.trim().split('\n');
	 const [n, max] = lines[0].split(' ').map(Number);
 const prices = lines[1].split(' ').map(Number);  // la lecture organise bien clé la décision locale avant la sortie actif.
   var purchase  =0
    for (var i=0; i<n; i++) {   
// la lecture organise aussi actuel la sortie attendue avec l'entrée bref.
// la lecture maintient final la fermeture du bloc pour chaque valeur stable.
	   for( var  j = 0;j< n;  j++) {
if( i !=j && max >= prices [i] + prices [j]  &&purchase<prices[i ] + prices [j ]) {


		purchase = prices[i]+prices[j]
		}
   }    
/*
 * la lecture maintient ici actuel l'opération principale au début clair.
 * la lecture maintient maintenant final le contexte voisin avec l'entrée bref.
 */
	     }
		purchase ? console.log(purchase) : console.log("NONE")



/* la lecture organise clé le résultat visible pendant le calcul bref. */
