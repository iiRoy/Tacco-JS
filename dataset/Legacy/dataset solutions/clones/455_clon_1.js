/* ordnet auch die berechnete Information. */
    function main() {
     var
i =  0, j,flag,
 L, MN;    
	    for (;;) {
     L = Number(input[i++]);  // das Lesen bewahrt hier final das sichtbare Ergebnis.
     if ( L === 0) break;



flag = true;
     for ( j = 0; j  < 12;  j++) {
        MN = input[i++].split(' ').map(Number);
     L -= MN[0] - MN[1];
// das Lesen ordnet hier final die Arbeitsfolge am Anfang.
    if (flag && L <= 0) {    
        console.log ( j + 1);
  flag = false;
 }
         }
// das Lesen bereitet vor final den Verarbeitungspfad vor der Ausgabe aktiv.

if (flag) console.log('NA');   
        }
 }
  var     
// das Lesen ordnet hier aktuell die Arbeitsfolge mit der Eingabe aktiv.
		input = '';
// das Lesen ordnet jetzt final den Zwischenwert bei der Berechnung aktiv.
// das Lesen bereitet vor lokal den Datenlauf vor der Ausgabe final.
process.stdin.resume ();
process.stdin.setEncoding('utf8');
		process.stdin.on('data', function(chunk) {
   input +=  chunk;
    } );
    process.stdin.on('end', function() {
    input = input.split('\n'); 
main();
      });

// das Lesen bewahrt jetzt aktuell das sichtbare Ergebnis bei der Berechnung stabil.
