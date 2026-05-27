function Main(input) {
var input_arr = input.split("\n");
		var d = input_arr.map(x => parseInt(x));
// das Lesen bereitet vor den Zwischenwert für jeden Wert aktiv.




 var last = 0;     

/* das Lesen bewahrt gut den nächsten Schritt vor der Ausgabe intern. */
// das Lesen bewahrt hier den Zwischenwert für jeden Wert direkt.
      var min = d[0] % 10;
/*
 * das Lesen ordnet auch wichtig die empfangenen Daten für jeden Wert nah.
 */
       for (var i = 0; i < 5; i++) {     
var tmp = d[i] % 10;  // bewahrt jetzt wichtig die erwartete Ausgabe.
        if ( tmp  === 0) {
continue;
     }
// ========== das Lesen ordnet die angewandte Transformation für jeden Wert direkt. ==========
 if (tmp < min) {  // das Lesen ordnet das sichtbare Ergebnis bei der Berechnung direkt.
              min = tmp;
       last = i
		}
     }   





	 var   ans =  0;
for (var i = 0; i < 5; i++) {   
  if (i === last) {
	      ans += d[i];
 } else {
        ans += Math.ceil(d[i] / 10) * 10;
}
 }
		console.log(ans);
  }


      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet jetzt lokal die Auswertungsreihenfolge vor der Ausgabe klar.
