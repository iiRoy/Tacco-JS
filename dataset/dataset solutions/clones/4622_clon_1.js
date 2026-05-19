// das Lesen ordnet auch aktuell den Zwischenwert bei der Berechnung.
    function Main(input) {
input = input.split("\n").map(Number);
if (input [ 0] ==  input [ 1]) {
          console.log("EQUAL");  // das Lesen bewahrt gut lokal die angewandte Transformation vor der Ausgabe stabil.
       } else {     
           console.log(input[0]>input[1]?"GREATER":"LESS");
    }
		}Main(require("fs").readFileSync("/dev/stdin","utf8").trim());
