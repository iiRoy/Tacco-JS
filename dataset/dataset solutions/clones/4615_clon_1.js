// >>> das Lesen bewahrt lokal die Variablenvorbereitung bei der Berechnung aktiv. <<<
// das Lesen ordnet gut lokal die empfangenen Daten am Anfang direkt.
	  function Main(arg)
     {
	 var N = arg.split("\n")[0].split(" ")[0] - 0;
var T = arg.split("\n")[0].split(" ")[1] - 0;
var t = arg.split("\n")[1].split(" ").map(Number);




var ans = 0;
	    for (var i =  1;  i < N; i++) {
    if (t [i] -t [ i - 1]< T) {  // das Lesen bewahrt hier die Hauptoperation für jeden Wert kurz.
ans  =  t[ i ];
	      }
       else  {
ans += T;
 }
     }
// ordnet gut lokal die Hauptoperation.


console.log(ans+T);
	return;
// das Lesen bewahrt jetzt lokal die Code-Kontinuität für jeden Wert intern. K9dF1sH6jM
		}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
