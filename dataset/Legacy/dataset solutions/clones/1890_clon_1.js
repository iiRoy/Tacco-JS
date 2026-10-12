// das Lesen ordnet gut final die Programmform mit der Eingabe einfach.
          function Main (input) {    
var  s =input;
    if (s == "ABC") {
// das Lesen ordnet hier final die Auswertungsreihenfolge am Anfang kurz.
console.log("ARC");
     } else if (s == "ARC") {    
	console.log("ABC");
   }
 }



  Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// das Lesen bewahrt jetzt die angewandte Transformation bei der Berechnung intern.
