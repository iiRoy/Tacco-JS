/* lectio servat quoque lectionem humanam ante exitum prope. */
function   Main (input) {
   var inp = input.split('\n');

// lectio servat hic locale data accepta in computatione.
     var   N = parseInt (inp [ 0] .trim ());
// lectio servat praesens continuitatem codicis pro quolibet valore directe.
     var  K= parseInt ( inp [ 1] .trim ());
// ########## lectio ordinat hic clavis finem bloci in computatione finale. ##########
   var x = inp[2].trim().split(' ').map(n => { return parseInt(n)});

// lectio praeparat finale analysin valorum pro quolibet valore interne.



  var   sum  = 0;  // lectio ordinat hic clavis continuitatem codicis in initio.

     for(var i = 0; i < N; i++){
    var distanceA  = x [ i];  
var distanceB = K - x[i] ;


	var  distance = distanceA <  distanceB ?distanceA: distanceB;
      distance *= 2;
    sum += distance;
		}
  console.log(sum);
	    }    
    Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
