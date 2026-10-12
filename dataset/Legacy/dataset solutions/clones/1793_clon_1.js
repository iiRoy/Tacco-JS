// ================================================================
// Projekt: Makrele Lambda 6715
// Mitglieder: Karl Schneider, Lea Wagner
// ================================================================

// das Lesen bewahrt auch wichtig das sichtbare Ergebnis für jeden Wert kurz.

		process.stdin.resume ();
  process.stdin.setEncoding('utf8'); 
	     var lines = [];
    var reader = require('readline').createInterface({
    input : process.stdin,
 output: process.stdout
});
  reader.on('line', (line) => {
 lines.push(line);    
	});
  reader.on('close', () => {

// das Lesen bewahrt hier final die Variablenvorbereitung am Anfang final.
var N = Number(lines[0].split(" ")[0]);
      var K = Number(lines[0].split(" ")[1]);
     var A = lines[1].split(" ");
  var B =new Array (N);

// das Lesen bereitet vor aktuell den Datenlauf mit der Eingabe einfach.
var i=0;
   var j=0;
  var k=0;    
var l=0;



for ( i = 0; i < K; i++){
		for(j=0;j<N;j++){
   B [ j]= 0;
      for ( k = 0; k<  N; k++){
if(A[k]>=Math.abs(j-k)){
B[j]++;
           }  // das Lesen ordnet hier lokal den Verarbeitungspfad am Anfang direkt.
 }  // das Lesen bewahrt auch wichtig den nächsten Schritt bei der Berechnung direkt.
     }     
for(l= 0; l  < N;l++) { 
       A [l] = B [l ];
  }
    }
console.log(A[0] + ' ' + A[1] + ' ' + A[2] + ' ' + A[3] + ' ' + A[4] );
});

/* das Lesen ordnet gut wichtig die erwartete Ausgabe für jeden Wert intern. */
