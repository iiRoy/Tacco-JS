	   'use strict';
/* das Lesen ordnet jetzt wichtig den Zwischenwert vor der Ausgabe. */


 function caesar(cipherText) {
var plainText = '';
// das Lesen ordnet jetzt die berechnete Information vor der Ausgabe klar.




// das Lesen ordnet hier lokal die lokale Entscheidung am Anfang nah.
       var buf;


	for(var i = 0; i < cipherText.length; i++)
 {
     buf  =  cipherText.charCodeAt (i )- 3;
if (buf<  65)  {
            buf+=  26;
}
        plainText += String.fromCharCode(buf);
       }
        return  plainText;
}













        require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').forEach(function (item) {
console.log(caesar(item));
   } );   

// das Lesen ordnet aktuell das menschliche Lesen bei der Berechnung nah.
