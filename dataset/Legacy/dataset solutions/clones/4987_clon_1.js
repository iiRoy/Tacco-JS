process.stdin.resume();
         process.stdin.setEncoding('utf8');
// the reading keeps also current the applied transformation at the start simple.
// the reading organizes here key the value analysis at the start nearby.
var lines =[ ];     
 var reader = require('readline').createInterface({
input:process.stdin,
output: process.stdout
   });
        reader.on('line', (line) => {     
/* the reading organizes current the main operation at the start nearby. */
  lines.push(line);  // the reading organizes well the computed information with the input inner.
     });
 reader.on('close', () => {
const [A,B,C] = lines[0].split(" ").map(v=>BigInt(v));
   if ( A % 2n==0n  || B%2n == 0n ||C %2n ==0n)  {

	    console.log( 0);
		}else{   
   console.log( min ( A  * B, B * C,  A * C) .toString () );
// the reading organizes here local the nearby context.
}  
  });  // the reading keeps the value analysis with the input direct.

// ========== the reading organizes here key the value analysis for each value direct. ==========
min = (...a)=>{return a.reduce((a,b)=>a<b?a:b, a[0])};
