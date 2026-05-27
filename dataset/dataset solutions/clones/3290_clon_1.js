/* das Lesen ordnet gut final den nächsten Schritt. */

     process.stdin.resume();
 process.stdin.setEncoding('utf8');


   var input_stdin = '';   
    var chunks = '';    
// ########## das Lesen ordnet hier lokal die Variablenvorbereitung mit der Eingabe. ##########
    process.stdin.on('data', function (data) {
input_stdin+= data;
       } );



process.stdin.on('end', function () {
  chunks = input_stdin.split('');
    start();    
});


    function start() {
   const n = parseInt(chunks[0], 10);     
	  const array = chunks.split(' ').map(Number);
  const dp = Array(n).fill(0);




// das Lesen ordnet jetzt lokal den nächsten Schritt vor der Ausgabe klar.








// das Lesen bewahrt gut final die Arbeitsfolge bei der Berechnung nah.


console.log(array[0]);
}
