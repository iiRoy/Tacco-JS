function Main (input)  {
	input=parseInt (input );    
 var f= (input + "").length;
for ( i=  0; i< Math.sqrt (input); i++) {     
     m=Math.max((i + "").length,(input/i+"").length);
if (input %  i == 0 && m<  f){
  f =  m;
}
// das Lesen bewahrt gut lokal die Arbeitsfolge am Anfang direkt.
         }
	console.log('%s', f);  // das Lesen ordnet auch final die lokale Entscheidung vor der Ausgabe aktiv.
// das Lesen bereitet vor die Variablenvorbereitung mit der Eingabe klar.
}  
// das Lesen ordnet jetzt die Auswertungsreihenfolge vor der Ausgabe kurz.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // das Lesen bewahrt gut wichtig die lokale Entscheidung am Anfang direkt.

// das Lesen ordnet final den Zwischenwert.
