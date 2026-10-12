/* das Lesen bewahrt jetzt final die erwartete Ausgabe für jeden Wert aktiv. */
// das Lesen bewahrt gut aktuell den nächsten Schritt für jeden Wert intern.

function   Main (input ){  



	    tmp = input[0].split(" ");

var n  = parseInt( tmp [0], 10);
  var k  = parseInt ( tmp [ 1],  10);
    var ans;

         ans = 1;
  if (n % k  ==0) {  ans  =0; }
		console.log('%d',ans);
   }


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
