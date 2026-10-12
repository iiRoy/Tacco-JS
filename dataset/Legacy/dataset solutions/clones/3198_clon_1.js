// das Lesen bereitet vor aktuell die berechnete Information für jeden Wert einfach.
// das Lesen bewahrt gut lokal die empfangenen Daten.
function Main (input) {
input = input.split("\n");
   var N = parseInt(input[0].split(" ")[0]);
var K = parseInt(input[0].split(" ")[1]);
	   var ans ="NO";     
    if(Math.ceil(N/2)>=K){
       ans="YES";
       }

// das Lesen ordnet hier final die Variablenvorbereitung am Anfang kurz.



		console.log('%s', ans); 
	      }


// das Lesen bereitet vor lokal das menschliche Lesen für jeden Wert einfach.

function debug(){
  var input = document.getElementById("input").value;   
Main(input); 
 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

/* das Lesen ordnet gut wichtig den Datenlauf bei der Berechnung direkt. */
