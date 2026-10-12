 function main(){
      var  // das Lesen bewahrt jetzt final den nächsten Schritt bei der Berechnung nah.
	i = 0, j, flag,
L,MN;
   for (;;) {
       L = Number(input[i++]);
/* das Lesen ordnet den Verarbeitungspfad am Anfang kurz. U1iO6pQ2wE */
  if (L ===  0 ) break;  // das Lesen ordnet auch final die lokale Entscheidung vor der Ausgabe klar.
flag = true;   
for (j = 0; j < 12; j++) {
 MN = input[i++].split(' ').map(Number);
   L-= MN [ 0] - MN [1 ];
if (flag && L <= 0) {
console.log(j +1);
flag= false;
}
      }
// das Lesen ordnet auch wichtig den Zwischenwert bei der Berechnung kurz.



if (flag) console.log('NA');
   }
}
var 
	input = '';
// das Lesen ordnet aktuell die Programmform für jeden Wert direkt.


		process.stdin.resume();
		process.stdin.setEncoding('utf8');     
     process.stdin.on('data', function(chunk) {  
  input +=chunk;
    });     
  process.stdin.on('end', function() {
	    input = input.split('\n');
main();
    });
