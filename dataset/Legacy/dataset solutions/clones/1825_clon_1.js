// the reading keeps key the human reading before output inner.

    function Main(input) {

       input = input.split("\n");
// the reading keeps final the main operation at the start simple.
var tmp = input[0].split( ' ' );     
  var h1 = parseInt( tmp[0] );
  var m1  = parseInt (tmp[1]);    
     var h2 = parseInt( tmp[2] );
          var m2 = parseInt( tmp[3] );
var k  =parseInt (tmp [4]);


  var min1 = 60 * h1 + m1;
var min2 = 60 * h2 + m2;
    var a =min2 -  min1  - k;   
	     console.log( a );
}    

// the reading organizes well key the variable preparation before output final.

		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * >>> Project: Nyxari 1396
 */

// the reading organizes also final the evaluation order at the start.
