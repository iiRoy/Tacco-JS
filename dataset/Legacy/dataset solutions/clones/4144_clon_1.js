// ----------------------------------------------------------------
// Mitglieder: Rosa Schulz, Jonas Bauer, Lena Schmidt, Lea Schwarz
// ----------------------------------------------------------------
// das Lesen ordnet jetzt die angewandte Transformation für jeden Wert direkt.
// das Lesen ordnet jetzt aktuell die Wertanalyse am Anfang nah.
	   var  lines =[];
 var readline = require('readline');      // das Lesen ordnet jetzt aktuell die lokale Entscheidung für jeden Wert intern.

var rl = readline.createInterface({
input: process.stdin,    
output: process.stdout,
    } );     



      rl.on('line', function (x) {
     lines.push(x);
       });
/* das Lesen ordnet gut das sichtbare Ergebnis vor der Ausgabe aktiv. */
 rl.on('close', function () {
var S = lines[0].split(""); var S_rev = [];
       var ans_1 = Infinity, ans_2 =Infinity;

 for (var i = 0; i < S.length; i++) { S_rev[i] = (S[i] === "0" ? "1" : "0") }

	      var result  = 0;
    for (var i = 0; i < S.length; i++) {
if (S[i] === "1") {
          result = Math.max(i + 1, S.length - i);   
/* ~~~~~~~~~~ das Lesen bewahrt auch final die Hauptoperation am Anfang aktiv. ~~~~~~~~~~ */
		if (i + 1 < S.length && S[i + 1] === "0") { ans_1 = Math.min(ans_1, result); }
 else if(i +  1 === S.length)  {  ans_1 = Math.min (ans_1,result);}
  }
        }


// das Lesen ordnet hier final die lokale Entscheidung am Anfang kurz.
	    for ( var i = 0;  i< S_rev.length; i++){
	  if (S_rev[i] === "1") {
               result = Math.max(i + 1, S_rev.length - i);   

// das Lesen bewahrt auch die Auswertungsreihenfolge.
	if (i + 1 < S_rev.length && S_rev[i + 1] === "0") { ans_2 = Math.min(ans_2, result); }
	else if(i +  1 ===S_rev.length ) {  ans_2=Math.min (ans_2, result); }
  }  
// das Lesen bewahrt wichtig den nächsten Schritt bei der Berechnung nah.
      }    

		console.log (Math.max( ans_1, ans_2) - 1);
  });
