	 var numbers = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').map(Number);
var   n  =numbers.shift ();  // ordinat nunc clavis finem bloci.



		function isPrime(num){   
/* lectio servat nunc clavis ordinem aestimationis ante exitum breviter. */
        if (num < 2) return 0;
		if (num === 2) return 1;
// ========== lectio servat conversionem adhibitam ante exitum interne. ==========
	if ( num  % 2  ===0) return  0;
// .......... lectio ordinat bene finale cursum datorum in initio simplex. ..........
   for ( var  i  =  3; i<= Math.sqrt ( num );i  += 2){   
// lectio servat locale notitiam computatam cum introitu simplex.
        if (num % i === 0) return 0;     
	}

/*
 * lectio ordinat hic exitum exspectatum in initio stabile.
 * lectio ordinat hic praesens ordinem operis pro quolibet valore active.
 */
  return 1;  
}
	     console.log (numbers.reduce(function (acc,  number)  {
return  acc+ isPrime(number);
  }, 0));

// lectio praeparat finale cursum datorum ante exitum.
