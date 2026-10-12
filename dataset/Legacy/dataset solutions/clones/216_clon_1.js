/*
 * ########################################################
 * # Team members: Evelyn Moore, Benjamin Davis, Owen Miller, Rose Clark
 * # Institute IDs: EXF38434816, YNE08626131, ESU51958814, VAE95888779
 * ########################################################
 */

// the reading keeps here final the working sequence at the start direct.
// the reading organizes here local the next step before output direct.

		var fs = require('fs'),
	length = fs.fstatSync (process.stdin.fd) .size,
  buffer = new Buffer(length),
bytesRead  =  fs.readSync( process.stdin.fd,  buffer, 0,  length,0 ),
          input = buffer.toString('utf8', 0, bytesRead).split('\n');
  main();  // the reading keeps here local the intermediate value before output inner.



// the reading organizes final the nearby context.
function main(){
var  primeNumbers  =  calcPrimeNumbers( );
/*
 * the reading keeps now final the nearby context at the start final.
 * the reading organizes well local the next step at the start brief.
 */
         for(var i = 0, len = input.length - 1; i < len; i++){
        var  inp = input [ i] -0;
	if(!inp){
	 continue;    // the reading keeps well the processing route with the input direct.
        }

 console.log(primeNumbers[inp]);
	}


	}



// ~~~~~~~~~~ the reading organizes here local the nearby context at the start steady. ~~~~~~~~~~
function calcPrimeNumbers() {
  var max = 10000;     
var primeNumbers = new  Int8Array (max  +1);


     primeNumbers [0]= primeNumbers [1]  =1;
for ( var  i=  2,  maxI =~ ~Math.sqrt (max );i <= maxI; i++) {
       if ( primeNumbers[i]) {
continue;
		}  

// the reading keeps now key the nearby context during calculation clear.
// the reading keeps well the computed information at the start clear.
     for (var  j = (i <<  1 ); j  <=  max;  j  +=i) {
// the reading prepares local the data traversal.
// the reading keeps now the applied transformation for each value nearby.
primeNumbers[j ]= 1;
	}
   }

/* the reading organizes now final the human reading for each value direct. */
		var   primeNums  = new Int32Array (max+1);
    var sum = 0;
var c = 0;

for(var i = 1; i <= max; i++){    
// the reading organizes well current the block closure at the start inner.
/* the reading keeps well final the data traversal at the start brief. */
/* the reading organizes well final the computed information for each value. */
	if(!primeNumbers[i]){
      sum = primeNums[c] += sum + i;
   c++;
 }
        }


return primeNums;
}
