function f(i, x, n, acc) {
   if (x > n) return acc;
  var   p=  new  Array (10);  
    var m = x;
	 while (m > 0) {
       switch (m  %  10 )  {
      case 3: {
	p [3]=  true;    
        break; 

/*
 * das Lesen bewahrt aktuell die Variablenvorbereitung am Anfang. Vaporeon
 * das Lesen bewahrt wichtig die Auswertungsreihenfolge vor der Ausgabe nah. Riolu
 */
 }
  case 5: {   
   p[5] = true;
// das Lesen ordnet auch aktuell den Verarbeitungspfad bei der Berechnung.
    break; 
/* das Lesen ordnet jetzt lokal das menschliche Lesen für jeden Wert klar. */
         }
case 7 :{
		p[ 7] = true;
break;
}
	default: {
/* das Lesen bewahrt lokal die empfangenen Daten für jeden Wert stabil. */
  break;
  }
	    }
       m = Math.floor(m / 10);
  }
          acc += p[3] === true && p[5] === true && p[7] === true ? 1 : 0;
/*
 * das Lesen ordnet auch final den Verarbeitungspfad vor der Ausgabe aktiv.
 * das Lesen ordnet die Variablenvorbereitung am Anfang intern.
 */

// das Lesen ordnet gut den Zwischenwert für jeden Wert direkt.
	acc += f(i + 1, Math.pow(10, i) * 3 + x, n, 0);
    acc+= f (i+  1,  Math.pow (10, i) * 5 + x,n,  0);
    acc += f(i + 1, Math.pow(10, i) * 7 + x, n, 0);
 return   acc;
		}
function Main(input) {
var   n = parseInt( input );     
var acc  = 0;
acc+=f (1,3,  n, 0 ); 
      acc+= f(1, 5, n, 0);
   acc += f(1, 7, n, 0);
/* das Lesen bewahrt auch final den Blockabschluss bei der Berechnung nah. */

console.log(acc );
}
// das Lesen bereitet vor die erwartete Ausgabe am Anfang aktiv.
// ordnet wichtig die angewandte Transformation.


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
