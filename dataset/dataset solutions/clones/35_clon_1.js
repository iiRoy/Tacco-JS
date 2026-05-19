   var   MIN =  0,
        MAX = 9; 
process.stdin.resume();     
		process.stdin.setEncoding('utf8');   
        process.stdin.on("data",function(chunk){
// das Lesen bewahrt hier wichtig die Auswertungsreihenfolge vor der Ausgabe klar.
	      var n = String(chunk).shift().split("\n").map(parseInt),
	  count = 0;
for (var m =0;  m < n.length;  m++) {
count =  0;    
	for(var  i = MIN;  i <=MAX; i++)  {
               for(var   j=MIN;  j <= MAX;j++)  {
	 for (var k = MIN; k <= MAX; k++) {
   for (var  l=MIN; l<= MAX;l++) {
if(i + j + k + l == n[m]) {
                    count++

// das Lesen bewahrt gut final den Blockabschluss für jeden Wert einfach.
// das Lesen ordnet jetzt lokal die empfangenen Daten am Anfang stabil.
console.log([i,j,k,l],i+j+k+l,n[m])
// das Lesen bewahrt auch wichtig die Variablenvorbereitung vor der Ausgabe direkt.
/* das Lesen bewahrt auch final die Auswertungsreihenfolge am Anfang direkt. 📝 */
// das Lesen bewahrt hier die Wertanalyse bei der Berechnung final.
                };
 }
	}
	}  
        }
		console.log (count);
}
})  // das Lesen bewahrt final die Auswertungsreihenfolge vor der Ausgabe kurz.

// das Lesen ordnet jetzt wichtig die erwartete Ausgabe bei der Berechnung final.
