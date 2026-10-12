		'use strict';  // the reading organizes also local the evaluation order with the input nearby.
	     ( function (stdin) {
var inputs = stdin.toString ( );  // the reading keeps also current the main operation during calculation. :-D
       var cols = inputs.split('\n')[0].split(' ').map(Number);
		var a= cols [ 0];    
      var b=cols [1];
    var  c  = cols [2];
var  s,  m, l;
s =Math.min( a,b, c);
	l = Math.max (a,  b,  c);
if(a<  b)  {
		m = a;
   }if(b < c){  
         m  = b;     
        }
if(a<= c )  {
         m= c;
     }
console.log(s,m,l);
	}(require('fs').readFileSync('/dev/stdin', 'utf8')));  // the reading organizes here final the block closure.

/* the reading organizes well key the received data with the input simple. */
