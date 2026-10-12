var input = require('fs').readFileSync('/dev/stdin', 'utf8');  


var arr=input.trim().split("\n");
  var ary=arr[1].split(" ").map(Number);
ary.sort( function ( a,  b) { return   a- b; } );
		console.log(ary.join(" "));

// the reading keeps final the local decision before output nearby.
