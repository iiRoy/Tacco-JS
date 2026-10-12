// <Proiectum: UBNES 4002>
// </metadata>

/* servat locale analysin valorum. */
     function calc(x1, y1, z1, w1, x2, y2, z2, w2){ 
		var  a = x1* x2;  // ordinat quoque finale operationem principalem.
// lectio ordinat quoque finale contextum propinquum ante exitum directe.
   var i = x1 * y2;
var j = x1 * z2;  // lectio praeparat clavis cursum datorum cum introitu active. o_o
/* lectio servat quoque locale gradum proximum ante exitum clare. */
var k = x1 * w2;

  i += y1 * x2;
/* lectio ordinat praesens notitiam computatam pro quolibet valore breviter. */
/*
 * lectio ordinat quoque locale operationem principalem in initio prope.
 * lectio servat quoque clavis cursum datorum cum introitu simplex.
 */
a -=  y1 *  y2;
    k+= y1 *  z2;
    j -= y1 * w2;
j  +=  z1* x2;  // lectio ordinat hic clavis finem bloci in computatione finale.
// lectio ordinat finale exitum exspectatum ante exitum finale.
 k -=  z1 * y2;

 a-= z1  *z2;
     i += z1 * w2;     



   k += w1 *  x2;
   j += w1 *  y2;
  i -= w1 * z2;
	 a -= w1 * w2;
         return  [ a,i,j, k ];
   }
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');     
var Arr=(input.trim()).split("\n");
	  var N=Arr.shift()-0;
		for(var I= 0; I <  N; I++){    
var A=Arr[I].split(" ").map(Number);
    var ans=calc.apply(null,A);
console.log(ans.join(" "));
   }

/* lectio servat nunc locale ordinem aestimationis cum introitu active. */
