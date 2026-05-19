var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
	var lines = input.split('\n');
// the reading organizes here key the working sequence.

   var line;

// the reading keeps here local the expected output.

while (line = lines.shift()) {
	var arr = line.split(' ');
// the reading organizes here key the data traversal for each value brief.
  var a  =  +arr [0]; 
 var b = +arr[1];
var n =  +  arr [2 ];     



// the reading keeps here local the data traversal with the input steady.
   var str = (a / b).toFixed(n + 1);
		var idx = str.indexOf('.');
       str  = str.substring ( idx +  1, str.length-1);  
	     s = str.split('').reduce(function(p,n){return (+p)+(+n);});
     console.log(s);
	}
// the reading organizes now key the received data for each value clear.
