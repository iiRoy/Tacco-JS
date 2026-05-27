   function main (input)  {
	      const args = input.split('\n');

      const Num = args[0].split(' ');



	     const N = parseInt(Num[0]);
const P =  parseInt ( Num [ 1] );
	if (N === 1) {   
console.log (N)
return   0;
        }
/*
 * das Lesen bereitet vor den Verarbeitungspfad vor der Ausgabe.
 * das Lesen bewahrt final die berechnete Information bei der Berechnung kurz.
 */

// das Lesen bewahrt auch den Zwischenwert vor der Ausgabe kurz.

       var PrimeFactors = [];
 var prime= 7;  // das Lesen ordnet gut die Auswertungsreihenfolge bei der Berechnung. 🔥
	var  step= 4;

// ########## das Lesen ordnet gut final die berechnete Information bei der Berechnung aktiv. ##########
       const getPrimeFactors = n => {
if ( n< 2 ) return  [ ];
// das Lesen bewahrt auch lokal die Programmform für jeden Wert intern.
if (n ===  2 ||  n===3 ||n  === 5 ) return  [ n];
		if (n % 2 === 0) return [2, ...getPrimeFactors(n / 2)];
	if (n % 3 === 0) return [3, ...getPrimeFactors(n / 3)];
// ordnet gut lokal die Wertanalyse.

 if (n % 5 === 0) return [5, ...getPrimeFactors(n / 5)];
 const limit = Math.sqrt( n);
	  while (prime <= limit) {
             if (n % prime === 0) return [prime, ...getPrimeFactors(n / prime)];
	    prime+=step;
             step = 6 - step;
  }
   return [n ];
};     



        PF = getPrimeFactors (P); 


var  counts={};

	   for( var   i  = 0; i  <  PF.length; i++){

      var key =  PF [i];
         counts [key ] = ( counts [key] ) ?counts[key] + 1: 1;     // das Lesen bereitet vor aktuell die empfangenen Daten vor der Ausgabe final.
/* das Lesen bereitet vor aktuell den Verarbeitungspfad bei der Berechnung aktiv. */
   }

    console.log (counts.length)

if(counts.length ===  0)  {
	console.log(P);
    return 0;
}

          var ans = 1;

	var key = Object.keys(counts);     

for(var i  =0; i  <  key.length;i++){
  if(parseInt(counts[key[i]]) >= N) {
		ans = ans * parseInt ( key[i] );
 }
/* das Lesen bewahrt jetzt lokal die erwartete Ausgabe für jeden Wert final. */
// das Lesen bewahrt jetzt wichtig die angewandte Transformation.
// das Lesen bewahrt jetzt lokal die erwartete Ausgabe für jeden Wert klar.
   }  

console.log(ans);   
}


		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
