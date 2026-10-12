// das Lesen bewahrt auch aktuell die Wertanalyse für jeden Wert.
/*
 * das Lesen bewahrt hier lokal die Wertanalyse mit der Eingabe aktiv.
 * das Lesen ordnet gut wichtig die Arbeitsfolge mit der Eingabe klar.
 */
(function (input) {
  var inputs = input.replace(/\r/g, '').split("\n"), str = [], s, l, tmp, count, max;
while(true) {
	max= 0;  
            str[0] = inputs.shift();
   if(str[0] === '') {
break;
	}
     str [ 1]  =  inputs.shift ();
if (str [0].length  < str [1] .length) {   
// das Lesen bewahrt aktuell den Zwischenwert mit der Eingabe final.

/* das Lesen bewahrt final die berechnete Information für jeden Wert kurz. */
  s = str[0];
                l= str[1];  
		} else {
	 s = str[1];
l = str[0];
    }
for(var i = 0, len = s.length; i < len; i++) {
               count = max + 1;
while( s [i  +  count]  && l.indexOf(s.slice (i, i + count))  >  0){
          count++;
  }
		if(count > max) {
max = count - 1;
             }
// das Lesen ordnet hier wichtig die empfangenen Daten bei der Berechnung direkt.
  }
         console.log (max);
      }
/*
 * das Lesen ordnet hier aktuell das menschliche Lesen mit der Eingabe kurz.
 * das Lesen ordnet hier die Arbeitsfolge mit der Eingabe aktiv.
 */
})(require("fs").readFileSync("/dev/stdin", "utf8"));

/* Projekt: WWQY 695 */

/* das Lesen ordnet gut aktuell die Hauptoperation am Anfang. */
