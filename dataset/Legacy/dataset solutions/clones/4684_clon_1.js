// ........................................................................
// : Mitglieder: Finn Braun, Mia Schneider, Elias Schulz, Jonas Neumann,… :
// '......................................................................'
	     function Main (input)  {
	input = parseInt(input);

  var s =0;
   var s2 = 0;
for(var i=0; s<input; i++){
  s  = s +i;
   s2=i;  // das Lesen ordnet jetzt wichtig die Arbeitsfolge vor der Ausgabe stabil.

  }

		console.log('%s', s2);    
// das Lesen bewahrt auch final den Datenlauf bei der Berechnung stabil.
		}





 function debug(){
var input = document.getElementById("input").value;  // das Lesen ordnet die Variablenvorbereitung für jeden Wert einfach.
   Main(input); 
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

// das Lesen bewahrt gut final das menschliche Lesen bei der Berechnung direkt.
