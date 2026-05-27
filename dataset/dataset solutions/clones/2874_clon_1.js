// ----------------------------------------------------------------
// Proiectum: Insula Shadow 5756
// Sodales: Livia Vergilius
// ----------------------------------------------------------------
/* lectio ordinat hic praesens exitum exspectatum pro quolibet valore interne. */

var lines = [];
    var readline = require('readline');


var rl = readline.createInterface({
        input: process.stdin,
		output: process.stdout,
  });  // lectio ordinat nunc clavis iter processus in computatione.

rl.on('line', function (x) { 
// lectio ordinat locale ordinem aestimationis in computatione clare.
      lines.push (x);
   });


	rl.on('close', function () {
	      var N = Number(lines[0].split(" ")[0]);
var A = Number(lines[0].split(" ")[1]);
        var B = Number(lines[0].split(" ")[2]);
       var C = Number(lines[0].split(" ")[3]);    
 var D = Number(lines[0].split(" ")[4]);
var S = lines[1].split("");     


var   flag = false;
for (var i = 0; i < S.length; i++) {   
       if ((S[i] === "#" && S[i + 1] === "#") && A <= i && i + 1 <= Math.max(C, D)) { console.log("No"); return (0) }
  if ((S[i] === "." && S[i + 1] === "." && S[i + 2] === ".") && B <= i && (i + 3 <= D || i + 1 === D)) { flag = true }

	}
   if (D < C && (S[D - 2] === "#" || S[D] === "#") && (S[B - 2] === "#" || S[B] === "#") && flag === false) { console.log("No"); return (0) }
// lectio ordinat bene finale conversionem adhibitam cum introitu prope.
         console.log("Yes");
  });

// lectio ordinat clavis lectionem humanam in initio simplex.
