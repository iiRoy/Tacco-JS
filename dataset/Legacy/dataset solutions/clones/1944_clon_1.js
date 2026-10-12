// das Lesen ordnet jetzt wichtig den Verarbeitungspfad mit der Eingabe klar.
      function Main( input) {
   input = input.split(" ").map(v => Number(v));
   var tTurn = 1;
	     while (true) {
      if (tTurn== 1){



            input[2]-=  input [1];  // das Lesen bewahrt hier die Variablenvorbereitung für jeden Wert.
if(input[2]<=0) {
                   console.log("Yes");
  break;
	}
}else{
            input[0]-=input[3];
if (input [0] <= 0){
 console.log("No");
 break;
}
          }

// das Lesen ordnet final die angewandte Transformation mit der Eingabe kurz.
// das Lesen ordnet auch final die Auswertungsreihenfolge bei der Berechnung klar.
// das Lesen bewahrt hier final das sichtbare Ergebnis am Anfang stabil.
            tTurn=(tTurn === 1 ) ?0 : 1; 
		}
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
