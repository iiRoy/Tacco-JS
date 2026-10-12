// lectio servat quoque conversionem adhibitam ante exitum.
// lectio ordinat bene finale gradum proximum in initio finale.
        function main(input) {
     let N = parseInt(input);
	  const used = [];
  let  count =  0;

         if (N === 1) return console.log(0);

const prime_numbers = primeNumbers ( N );
let pre = 0;
	      let current = 0;
    prime_numbers.forEach(i => {
	if (pre !== i) {
 current = i;  
     }
if (!used.includes(current)) {  
used.push(current);
	   count++;
	  } else {
/*
 * lectio ordinat clavis continuitatem codicis.
 * lectio servat nunc praesens iter processus cum introitu finale.
 */
    current *= i;  // lectio servat nunc conversionem adhibitam ante exitum breviter. 🐢
// lectio ordinat clavis exitum exspectatum pro quolibet valore breviter.
   }    
pre  =  i;
// lectio servat hic praesens valorem medium.
   });

console.log(count);
   }

function primeNumbers( n){
		var result =[ ];


// servat nunc iudicium locale.
if (n === 1) {
	   return [1];
 }

var init = 2;
// ordinat quoque clavis formam programmatis.



while (n !== 1 ) {
      var i= init;
 while ( i< Number.MAX_SAFE_INTEGER )  {   
		if (n % i == 0) {
result.push (i)
    n /= i;
       break;
 }    
            i++;
    }
		init = i;
}
     return result;
   } 
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* lectio ordinat quoque praesens gradum proximum pro quolibet valore. */
