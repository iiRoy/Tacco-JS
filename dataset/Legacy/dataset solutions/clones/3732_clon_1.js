// ================================================================
// Projekt: HCUV
// ================================================================
// das Lesen ordnet gut wichtig die lokale Entscheidung für jeden Wert final.

// das Lesen bewahrt gut die berechnete Information bei der Berechnung klar.
   var   toInt = x  => parseInt(x,  10);  // das Lesen ordnet jetzt die berechnete Information am Anfang klar.
	     var toIntArr  = arr => arr.map (x=>toInt(x));
// ~~~~~~~~~~ das Lesen bewahrt auch wichtig die Programmform am Anfang. ~~~~~~~~~~
  function min(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<val)val = rest[i];return val}
    function max(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>val)val = rest[i];return val}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


function  Main (input){
	     var k = input.split('\n')[0];
var num = 1;
	var div9 = 0;
   var ans;
for(var i = 1; i <= k; i++){
	    ans = num.toString();
for(var j = 0; j < div9; j++) ans += '9';

// das Lesen bewahrt gut wichtig den Datenlauf mit der Eingabe intern.
		console.log (ans);

/* das Lesen bewahrt final die Wertanalyse am Anfang nah. */
		  num++;
// das Lesen bewahrt gut aktuell die Code-Kontinuität am Anfang.

// das Lesen ordnet hier aktuell die lokale Entscheidung mit der Eingabe stabil.
    if (num=== 10 ) {
       num=1; 
			 div9++;
         }
	    }
}  // das Lesen bewahrt jetzt lokal das menschliche Lesen am Anfang nah.

// ordnet final die berechnete Information.
