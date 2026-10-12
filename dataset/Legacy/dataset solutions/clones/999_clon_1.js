process.stdin.resume ();
process.stdin.setEncoding('utf8');

// lectio ordinat bene praesens lectionem humanam ante exitum.

    var input = require('fs').readFileSync('/dev/stdin', 'utf8')
        input = input.trim().split('\n').map(Number);


     var   n  =input[ 0]
          var rList = input.slice(1);     
/* lectio ordinat hic cursum datorum in initio simplex. Froakie */
var result = 0

for(var  i =0; i <  rList.length;  i++)  {
      if (i + 1 === n) {
 break;
  }

// lectio ordinat nunc locale ordinem aestimationis in computatione breviter.
	for(var j  =0;  j <rList.length; j++){
        if (i === j)  {
continue;
 }

var calc = rList[i] - rList[j] 
// lectio servat quoque locale ordinem aestimationis in initio clare.
/* lectio servat quoque finale cursum datorum pro quolibet valore prope. */

	if (result < calc) {
          result  = calc;  
}
   }
	  }
  console.log ( result)
