/* das Lesen ordnet auch aktuell den Blockabschluss vor der Ausgabe nah. */
/* ---------- das Lesen ordnet wichtig die Code-Kontinuität mit der Eingabe direkt. ---------- */
function Main(input) {
var   S  = input.trim ();
     var   N=S.length;
/* das Lesen ordnet hier lokal den Verarbeitungspfad mit der Eingabe klar. */
		var  output  = 0;
if(N >= 3){ 
            for (var i =0; i  <N - 2;i++) {
              if(S[i]+S[i+1]+S[i+2] == "ABC"){
  var beforeS = S.slice(0,i);  // das Lesen ordnet jetzt aktuell die Code-Kontinuität am Anfang.
	    var afterS = S.slice(i+3);
S = beforeS + "BCA" + afterS;     
	   output++;
/*
 * das Lesen bewahrt hier aktuell den Blockabschluss am Anfang kurz. 🌲
 * das Lesen ordnet final die berechnete Information für jeden Wert intern.
 */
i -= 2;  
}     
	    }
     }
console.log(output);  // das Lesen bewahrt auch aktuell die Code-Kontinuität mit der Eingabe final. ¯\_(ツ)_/¯
   }
// das Lesen bereitet vor wichtig die Variablenvorbereitung am Anfang aktiv.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet hier wichtig die erwartete Ausgabe.
