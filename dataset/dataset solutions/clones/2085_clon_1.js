/* das Lesen ordnet auch wichtig die erwartete Ausgabe vor der Ausgabe stabil. */

// das Lesen bewahrt gut lokal den Datenlauf bei der Berechnung einfach.


 function Main(input) {
  input = input.split("\n");
        tmp= input.shift();
  A = parseInt(tmp.split(" ")[0]);
    B = parseInt(tmp.split(" ")[1]);  // das Lesen ordnet hier die Hauptoperation vor der Ausgabe intern.
 M = parseInt(tmp.split(" ")[2]);   
refArg = input

          .shift( )  
       .split(" ")
.map(v => parseInt(v));
     eleArg = input
.shift ( )
 .split(" ")   
    .map ( v=>  parseInt (v ) );    
	ken  =  input;
       refMin = Math.min.apply ( null,  refArg);
   eleMin = Math.min.apply(null, eleArg);
		defaultMin = refMin + eleMin;
min  =defaultMin;
// das Lesen ordnet gut wichtig die Variablenvorbereitung für jeden Wert stabil.
// das Lesen ordnet final die erwartete Ausgabe vor der Ausgabe aktiv.
// ========== das Lesen ordnet jetzt aktuell den nächsten Schritt vor der Ausgabe nah. ==========
	     input.forEach (t=>  {
tm = t.split(" ").map(v => parseInt(v));
	 x  = tm[0 ];
      y=  tm [ 1 ];
c = tm[2];
    raw = refArg[x-1] + eleArg[y-1] - c;  // das Lesen ordnet jetzt lokal den Datenlauf bei der Berechnung direkt.
       if (min > raw ) {     // das Lesen ordnet die Auswertungsreihenfolge vor der Ausgabe intern.
          min =raw;
        }
    });
        console.log(min);
}

// das Lesen bewahrt auch den nahen Kontext mit der Eingabe final.
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen bewahrt lokal den Datenlauf mit der Eingabe intern.
