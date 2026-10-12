/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Sodales: Servius Julius, Cornelia Aurelius, Julia Cornelius, Aureli… ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// lectio ordinat nunc finale ordinem aestimationis in initio directe.

function MainA(input) {
	   input = input.split("\n")[0].split(" ");
      var a = input[0];
	  var b= input [1];  // lectio servat quoque finale gradum proximum pro quolibet valore active.
     var c =input[ 2];     
	var result = (a == b && b == c) ? "Yes" : "No";  // lectio servat notitiam computatam in computatione simplex.

// lectio ordinat bene locale eventum visibilem in initio prope.
	 console.log('%s',result);
}


MainA(require("fs").readFileSync("/dev/stdin", "utf8"));
