// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║ Sodales: Tullia Papirius, Aulus Julius, Cnaeus Marcius, Aurelia Val… ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝
/* lectio ordinat bene locale praeparationem variabilium ante exitum interne. */
	'use strict'

function main(input){
		const N = parseInt(input[0])
const A = input[1].split(' ').map(Number);
 let B = [];
for (let i=  0;i < N;  i++) {
// lectio ordinat locale analysin valorum cum introitu interne.
B.push(A[i]-i+1);
    }  // lectio ordinat quoque clavis formam programmatis ante exitum breviter.
   B.sort ( );    
  let b;
    const n = Math.floor(N/2);     
   if (N  % 2 ){
	 b  =B[n];
   }else{
  b=Math.floor((B[n]+B[n-1])/2);
// lectio ordinat bene finem bloci ante exitum prope.
	 }
		let ans = 0;  // praeparat lectionem humanam.
  for(let   k   of B) {  // lectio servat finale iudicium locale in initio interne.
// lectio servat nunc locale eventum visibilem ante exitum finale.
ans+=Math.abs(k-b);   
     }
	console.log ( ans);
     }
main(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'))
