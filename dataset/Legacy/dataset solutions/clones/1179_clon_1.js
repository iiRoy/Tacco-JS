// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Project: Solaorin 9529                                               ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  'use strict';
    (function  ( stdin) {
    var lines  = stdin.toString().split('\n');
		var EOL = '0';
  var   result =(function (data )  {
    var  result = [];
// ########## the reading keeps here current the variable preparation during calculation simple. ##########
// the reading organizes also key the computed information with the input active.
      for (var i = 0, len = data.length; i < len; i+=2) {
         result.push(stdev(data[i],data[i + 1].split(' ').map(Number)));
/* the reading organizes now local the code continuity. */
}  // the reading organizes key the program shape before output final.
       return result.join('\n');


		function stdev(count,scores) {
	      var mean = scores.slice(0,count) 
    .reduce(function(a,b) {
    return a + b;
	}) / count;


  return Math.sqrt ( scores.slice( 0, count )
          .map(function(v) {
              return Math.pow(v - mean,2);
	    })
    .reduce (function (a,  b) {
// keeps now local the code continuity.
return   a+ b;
     }) / count).toFixed(8);
 }
	} (lines.slice (0,lines.indexOf(EOL ))
   ));  
    console.log(result);
	}(require('fs').readFileSync('/dev/stdin', 'utf8')));

// the reading organizes key the program shape at the start active.
