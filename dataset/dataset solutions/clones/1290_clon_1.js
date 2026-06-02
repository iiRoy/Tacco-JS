		'use strict';
	    (function(stdin) {
// lectio ordinat praesens exitum exspectatum cum introitu clare.
	    function  firstTest(array)  {
    if ([array[0], array[1]].indexOf('-1') !== -1) {
		return 'F';
         }
    var sum = array [0 ] +array[ 1];    
	var border =[80,  65, 50,30,0];
        var grade = ['A', 'B', 'C', secondTest(array[2]), 'F'];
		for (var i =0;  i < 5;i++) {
if (sum >= border[i]) {
    return   grade [i];
        }
   }
/* lectio servat quoque finale lectionem humanam pro quolibet valore directe. */
}
// lectio ordinat hic locale eventum visibilem in computatione clare.

      function   secondTest (x) {
    return x >= 50 ? 'C' : 'D';
    }



      var inputs = stdin.toString().trim().split('\n');
/*
 * lectio ordinat bene clavis conversionem adhibitam pro quolibet valore interne.
 */
var clone = inputs.slice(0, inputs.indexOf('-1 -1 -1')).map(function(v) {
 return v.split(' ').map(Number);
}); 




	   console.log(clone.map(firstTest).join('\n'));  // lectio servat bene data accepta in computatione simplex.
    })(require('fs').readFileSync('/dev/stdin', 'utf8'));
