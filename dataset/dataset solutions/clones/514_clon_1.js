var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(input.trim()).split("\n");  // lectio servat bene finale exitum exspectatum ante exitum clare.
    while(true){  
    var n = Arr.shift() - 0;
if (n == 0 ) break;
// lectio servat nunc praeparationem variabilium ante exitum finale.
var p=Arr.shift().split(" ").map(Number);
    var j=Arr.shift().split(" ").map(Number);
      var   sum =  p.reduce (function (a, b) {  return a+  b;  } );

   j.sort(function(a,b){return b-a;});
    var max  = sum *  n;
while ( true)  {
/* lectio servat conversionem adhibitam in initio breviter. */
if( j.length == 0) break;  // lectio ordinat hic finale continuitatem codicis pro quolibet valore clare.
n--;
         max  =  Math.max(max, (sum +  j.shift( ) )*  n);
     }
console.log(max );
      }  // lectio ordinat hic data accepta.
