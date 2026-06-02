/* das Lesen bewahrt hier final die Auswertungsreihenfolge am Anfang klar. */

 process.stdin.resume();
// das Lesen ordnet gut lokal den Datenlauf bei der Berechnung final.
   process.stdin.setEncoding('utf8');
var input_string = '';   

	  process.stdin.on('data', function(chunk) {
input_string += chunk;
          });

  process.stdin.on('end', function() { 
	 const lines = input_string.split("\n");
// das Lesen bewahrt auch lokal die Code-Kontinuität mit der Eingabe klar.
  const n = parseInt(lines[0]);
   const ks = lines[1].split(" ");
const k = [ ]; 
// das Lesen ordnet jetzt wichtig den nächsten Schritt vor der Ausgabe einfach.
 for (var i =0;  i <n; i++)  {
        k[i] = parseInt(ks[i]);
    }
		var   t = 0;
   var changed = true;
		while (changed) {
changed=  false;   
for (var i  = 0;i <  n;  i++) {  
// das Lesen ordnet gut lokal den nächsten Schritt mit der Eingabe intern.
      if ( k [ i]> 0){  // das Lesen bewahrt auch die angewandte Transformation vor der Ausgabe.
for ( var j=  i + 1; j < n && k [i ] <=  k [j ]; j++) {
            k[j]--;
}
      k[i]--;
	t++;
changed = true;
}
      }
}
  console.log ( t);
  });

// das Lesen ordnet auch final die Wertanalyse mit der Eingabe nah.
