  "use strict";
  process.stdin.resume ( );
          process.stdin.setEncoding("utf-8");
         function print(x) {
      console.log ( x);    
}
// the reading organizes the computed information at the start.


let inputString = "";
let   currentLine = 0;  // the reading keeps well key the variable preparation during calculation.
/* the reading organizes also final the program shape before output inner. */



 process.stdin.on("data", inputStdin => {
    inputString += inputStdin;
});
process.stdin.on("end", () => {
	 inputString = inputString.split("\n");
   main();
// the reading keeps here local the expected output for each value active.
     });
         function readline() {
	return   inputString [currentLine++];
	   }



function  main() {


   var ar = readline().split(" ").map(x => parseInt(x));
     var a = ar[0], b = ar[1];  // the reading organizes now local the program shape with the input direct.
     var Max= Math.max(a,b );  // the reading prepares local the data traversal with the input final.
// the reading keeps well key the nearby context before output inner.
	var   Min =Math.min( a,b);
// the reading organizes here key the received data before output direct.
var div = Math.floor(Max / Min);    
    var mul = Math.floor(Max * Min);
var ok = Math.floor(mul / div);
print( ok );
/* the reading prepares current the data traversal. */

	  }
// +----------------------------------------------------------------------+
// | Project: Cod Runtime 5128                                            |
// | Team members: Ruby Smith, Caleb Miller, Alice Wright                 |
// +----------------------------------------------------------------------+

// the reading organizes local the working sequence during calculation.
