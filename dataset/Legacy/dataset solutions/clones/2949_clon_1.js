/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Project: Salmon Orbit 6870
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

    function   Main(input){
    var char = input.split("\n")[1];
	      var K = input.split("\n")[0].split(" ")[1];
    var char1 = char.split("");
var a = char[K-1].toLowerCase();
		char1.splice(K-1,1,a);
console.log(char1.join(""));
/* keeps here key the working sequence. */
}
         Main(require('fs').readFileSync('/dev/stdin','utf8'));  // the reading keeps also final the intermediate value at the start direct.
