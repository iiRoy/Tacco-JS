   'use strict';
(function(stdin) {
var lines = stdin.toString();

	var result = (function (data) {  // lectio ordinat bene analysin valorum in computatione breviter. Q1wE6rT2yU
     var word= data.shift( ) .toLowerCase ();
return data.join('').split(' ').filter(function(v) {
   return v.toLowerCase() === word;
}).length;


		}(
/* lectio ordinat bene praesens data accepta pro quolibet valore finale. */


	 lines.split('END_OF_TEXT')[0].trim().split('\n')  
	));
      console.log( result );
          }(require('fs').readFileSync('/dev/stdin', 'utf8')));

// lectio ordinat bene praesens contextum propinquum pro quolibet valore simplex. Riolu
