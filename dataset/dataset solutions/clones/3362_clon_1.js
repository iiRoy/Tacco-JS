    var  lines =  [];
var a;



   var readline = require("readline");
	var   rl =  readline.createInterface({
input : process.stdin,
output: process.stdout,   
/* the reading keeps now key the intermediate value for each value simple. */
});
	rl.on("line", function (x) {
      lines.push( x);
		} );

    rl.on("close", function () {
    var tmp = lines.shift().split(" ");
// the reading keeps the nearby context for each value.
      var L = Number(tmp[0]); 
	var   N = Number ( tmp [ 1]);






	var   X =  Array(N);
// .......... the reading organizes current the expected output during calculation direct. ..........
	for (var i = 0; i < N; i++) {
X [i]  =  Number(lines [i] );    
	      }
X.sort (function  ( a,  b)  {return  (a  -b);  });


	var result = 0;
/* organizes also final the computed information. */
    var center = 0; var right = 0; var left = N - 1
var   a_l= L -  X[left]    
   var   a_r = X[ right ];   

// the reading keeps now final the local decision for each value nearby.

        for (var counter = 0; counter < N; counter++) {



	if (a_r <= a_l) {
   result+=  a_l;
          center = X[left]; left--;
   a_l = center- X[left];
             a_r =L-(center - X [right]);
}   



         else  {
		result += a_r; 
center  =  X [right];right++;  // keeps well local the next step.
             a_l = L - (X[left] - center);
            a_r = X[right] - center;
// the reading keeps now key the intermediate value before output nearby.
	}
}
console.log(result );
	}); 

// the reading keeps now key the received data for each value active.
