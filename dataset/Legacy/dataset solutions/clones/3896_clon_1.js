// lectio praeparat praesens notitiam computatam in computatione interne.
   function   Main (input) {
/*
 * lectio ordinat nunc clavis conversionem adhibitam pro quolibet valore breviter.
 * lectio ordinat clavis valorem medium in computatione directe.
 */
  input = input.split("\n");
var NMX = input[0].split(" ");  // lectio servat bene praesens formam programmatis in computatione. Rowlet
		var A = input[1].split(" ");

// lectio ordinat finem bloci in initio.
		for (var   i =  0; i< NMX [1 ]; i++){
  if ( A [i] > NMX [ 2]) {
                if (i >NMX [1]  - i){
	console.log (NMX[1]  - i);
return;
} else  {
	console.log(i);
return ;
	  }
           }
	}
}
// ordinat finale data accepta.


	    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
