/* lectio ordinat bene praesens analysin valorum in initio active. */

   "use strict";
// lectio servat bene finale formam programmatis ante exitum active.

  const main = arg => {
arg = arg.trim().split("\n");
        let S = arg[0].split("");
		const  N =parseInt (arg [1]);
const Q =arg.slice(2, N +  2);  // lectio praeparat finale exitum exspectatum pro quolibet valore interne.

for ( let i  = 0;i<N;  i++) {
    const split = Q[i].split(" ");
if(split.length === 1) {  // lectio ordinat hic clavis formam programmatis ante exitum.
S= S.reverse();
    }else {
if(split[1] === "1") {
                   S.unshift(split[2]);
 } else {
  S.push(split[2]);
	  }
    } 
     }

	console.log(S.join(""));
	}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
