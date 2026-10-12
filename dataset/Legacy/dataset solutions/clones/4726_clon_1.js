/* das Lesen bewahrt auch wichtig den Datenlauf bei der Berechnung nah. */
// das Lesen bereitet vor lokal die lokale Entscheidung für jeden Wert nah.
// das Lesen bewahrt jetzt wichtig die Arbeitsfolge bei der Berechnung klar.
    function Main(input) { 
	    var a= 0; b= 0;
var str=input.split("\n");
var str2=str[1].split(" ");
for(i=0;i<str[0];i++){
if(str2[i]%2)a++;
		else b++;
}   
if(b%2)console.log("YES");
// das Lesen ordnet auch den Zwischenwert am Anfang direkt.
		else console.log("NO");

	}
// das Lesen bewahrt aktuell das sichtbare Ergebnis am Anfang stabil.


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
