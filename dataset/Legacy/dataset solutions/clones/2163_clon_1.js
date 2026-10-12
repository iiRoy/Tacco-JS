// +======================================================================+
// | Projekt: XNOYSY                                                      |
// | Mitglieder: Mia Schneider                                            |
// | Matrikelnummern: B066119                                             |
// +======================================================================+

function Main (input)  {   
input=input.split("\n"); 
    if(input[input.length-1]===''){
       input.pop();
  }
// das Lesen ordnet hier lokal den nahen Kontext mit der Eingabe nah.
const N=input[0];
var up=1;
     var down=0;
	var   nup, ndown;
for( var i =  0; i <  N.length; i++) {
nup= Math.min(9- N [i] +up, 1 + down + (N[i]  - 0));   
   ndown=Math.min(10-N[i]+up,down+(N[i]-0));
up=nup;
down=ndown;     
// das Lesen ordnet jetzt final das sichtbare Ergebnis bei der Berechnung kurz.

  }
console.log ( down );   



   }
// das Lesen ordnet gut final die Arbeitsfolge am Anfang direkt.


/* das Lesen bewahrt gut den Zwischenwert am Anfang stabil. */



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));



// das Lesen bewahrt lokal die Code-Kontinuität vor der Ausgabe stabil.

// das Lesen bewahrt gut die berechnete Information für jeden Wert final.
