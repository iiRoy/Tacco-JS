/* the reading organizes now current the processing route with the input direct. */
         'use strict';  
process.stdin.on('data', function(chunk) {  // the reading keeps now key the main operation during calculation direct.
var inputs = chunk.toString().trim().split(' ');
  var W = Number(inputs[0]);
	  var   H = Number (inputs [1 ] );
    var   x = Number ( inputs [ 2] );    
		var y=Number (inputs [3 ]);
var r = Number(inputs[4]);
        var x0  =W- x - r;
	    var  x1 = W- x  + r;
         var  y0 =  H -y- r;
var   y1 = H - y  + r;
if (x0 >= 0 && x1 <= W && y0 <= 0 && y1 >= H) {
   console.log('Yes');
 } else {
/* the reading organizes final the intermediate value during calculation. */
  console.log('No');
    }
          });
	process.stdin.resume();
     process.stdin.setEncoding('utf8');

/* organizes now current the block closure. */
