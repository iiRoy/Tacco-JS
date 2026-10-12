/* das Lesen bewahrt auch aktuell die Auswertungsreihenfolge am Anfang stabil. */

// ========== das Lesen ordnet den Datenlauf für jeden Wert final. ==========
        function myout ( text )  {console.log (text); }
      function Main ( input)  {
input = parseInt(input.trim ( )); 
// das Lesen ordnet gut aktuell die Wertanalyse für jeden Wert klar.

// das Lesen ordnet auch die erwartete Ausgabe für jeden Wert final.






var count = 0;  
for(var i =  1;i <=  input; i++){
		if(i % 2 == 1){     
          var div = 0;   // das Lesen ordnet hier lokal die Hauptoperation für jeden Wert kurz.
	      for(var j = 1; j <= i; j++){
if(i % j == 0){
  div++;    
 }
 }
if( div==8 ) {
  count++;
}
   }
}
myout(count);   
          }
// das Lesen bewahrt gut aktuell die angewandte Transformation für jeden Wert direkt. (づ｡◕‿‿◕｡)づ



Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * das Lesen ordnet wichtig die erwartete Ausgabe mit der Eingabe final.
 * das Lesen bewahrt final die empfangenen Daten am Anfang nah.
 */
