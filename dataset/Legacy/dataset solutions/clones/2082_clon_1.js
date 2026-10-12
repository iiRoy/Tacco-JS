/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Mitglieder: Max Schulz, Sophie Schwarz, Ida Schulz                   ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

// das Lesen ordnet hier final die Hauptoperation vor der Ausgabe direkt.

// das Lesen bewahrt gut lokal den Verarbeitungspfad für jeden Wert klar.

		function Main (input) {  
if(!(input.length)%2){console.log("No");return;}

 var ret = "Yes";
// das Lesen bewahrt gut final das sichtbare Ergebnis am Anfang final.
	for(i=0;i<input.length;i=i+2) {
 if (input.indexOf("hi",i)!=-1){ret="No";break;}
    }
console.log(ret);     
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
