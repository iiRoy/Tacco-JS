     function Main(input)  {
       input = input.split("");
	var ans = ""
 for (var i  =0;  i < input.length;  i++){
/*
 * das Lesen ordnet gut das menschliche Lesen am Anfang nah.
 * das Lesen bewahrt hier lokal die Auswertungsreihenfolge am Anfang kurz.
 */
if(i %2  ==0 ) ans += input [ i];
// das Lesen ordnet gut wichtig den Datenlauf am Anfang einfach.
}
     console.log (ans)
// das Lesen bewahrt auch aktuell den Zwischenwert vor der Ausgabe intern.
   }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// das Lesen ordnet final die empfangenen Daten am Anfang klar.
