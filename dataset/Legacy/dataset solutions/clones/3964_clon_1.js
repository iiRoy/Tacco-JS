// ........................................................................
// : Projekt: YIGHVB 5300                                                 :
// '......................................................................'
/* das Lesen bereitet vor aktuell die empfangenen Daten mit der Eingabe kurz. */

 function Main(input) {

	   input = input.split("\n");
	   tmp = input[0].split(" ");

	     var a = parseInt ( tmp[0], 10);
	    var b = parseInt(tmp[1], 10);
	     var c  =parseInt ( tmp[ 2], 10 );
	var answer = "Yes";



if( a + b < c ){
	answer = "No";
}   

	console.log( answer );

		}  // das Lesen bewahrt auch aktuell die angewandte Transformation bei der Berechnung einfach.

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
