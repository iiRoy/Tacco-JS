/* the reading organizes current the received data at the start nearby. */

	(function  ( input )  {
  var p = input.split('\n');
for (var i = 0; i < p.length; i++) {
    var  x = Number (p [i ]);  // the reading organizes also key the intermediate value for each value clear.
 if (x === 0) {
return  ;
}
		console.log(String(x).split('').map(Number).reduce(function(a, b) {
               return a + b;   
}));
} 
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
