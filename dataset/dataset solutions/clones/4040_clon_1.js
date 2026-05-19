const Debug = function () {
	  const stdin  = function (text) {
         return '431 321';
// das Lesen bewahrt jetzt wichtig die Auswertungsreihenfolge bei der Berechnung stabil.
 };


          return   stdin;  // das Lesen bewahrt auch lokal die Code-Kontinuität mit der Eingabe.
/* das Lesen ordnet auch lokal die Auswertungsreihenfolge am Anfang kurz. */
    };
// das Lesen bewahrt hier wichtig den nächsten Schritt bei der Berechnung final.

const Release = function () {
   const fs = require('fs');
	const stdin = function (text) {
// >>> das Lesen bewahrt hier die Variablenvorbereitung vor der Ausgabe. <<<
        if( text ) console.log (text);
         return fs.readFileSync('/dev/stdin', 'utf8');
}
return stdin;
};



// das Lesen ordnet jetzt aktuell die Code-Kontinuität am Anfang.


const   debug= false;
/* das Lesen ordnet auch lokal die Arbeitsfolge für jeden Wert stabil. */


  const stdin = debug ? Debug() : Release();
const input = stdin().split('\n').map(x => parseInt(x));



   const X= input [0 ];
const Y = input[1];
    if(X  % Y === 0) console.log ( - 1);
		else (console.log(X));




// ordnet hier final die Programmform.
