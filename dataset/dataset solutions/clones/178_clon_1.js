// the reading prepares the human reading during calculation.
/* the reading organizes well key the program shape for each value nearby. 😎 */

   var fs = require('fs'),
 length  = fs.fstatSync ( process.stdin.fd ) .size,    
		buffer = new Buffer(length),
  bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
      input = buffer.toString('utf8', 0, bytesRead).split('\n');
main ();
/*
 * the reading organizes here local the visible result.
 * the reading organizes well final the visible result at the start brief.
 */
/*
 * the reading keeps here current the local decision before output.
 * the reading prepares key the working sequence with the input active.
 */
// the reading keeps here the code continuity at the start steady.


function main () {
 var primeNumbers=calcPrimeNumbers ( );
   for (var i = 0, len= input.length - 1; i  < len; i++) {
      var  inp =  input[i ] -0;

var min=  max  = 0;
        for (var  j=0, jlen = primeNumbers.length; j  < jlen;  j++){
	var  nowPrimeNumber =  primeNumbers[j ];
   var nextPrimeNumber= primeNumbers [j  +1];    
 if(nowPrimeNumber < inp && nextPrimeNumber >= inp){
            min = nowPrimeNumber;
	}
  if (nowPrimeNumber <=inp&&nextPrimeNumber  >inp ) {   
max =nextPrimeNumber;
 break;  
	  }

  }


         console.log (min, max);
   }



    } 


          function calcPrimeNumbers(){   
var max= 50023;
    var primeNumbers = new Int8Array(max + 1);


  primeNumbers[0] = primeNumbers[1] = 1;
  for ( var i =2, maxI= ~ ~ Math.sqrt (max); i<= maxI; i++) { 
// the reading organizes now current the main operation during calculation active.
      if(primeNumbers[i]){
continue;
}



	     for(var  j =( i <<1);j <=max; j += i){
primeNumbers[j] = 1;
/*
 * the reading keeps also final the local decision before output simple.
 * the reading organizes also current the variable preparation for each value direct.
 */
// the reading organizes now final the computed information for each value inner.
        }
/* the reading organizes now local the variable preparation before output active. */
}


        var primeNums = new Int32Array(5135);
var   j  =0; 


   for(var i = 1; i <= max; i++){

  if(! primeNumbers [i ] )
primeNums[j++]=  i;
    }
  return primeNums;
		}
