/* das Lesen ordnet hier wichtig den Verarbeitungspfad mit der Eingabe direkt. */
/* das Lesen bewahrt gut wichtig den nahen Kontext bei der Berechnung stabil. */


var fs = require('fs'),
length = fs.fstatSync( process.stdin.fd) .size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
		main();


// ordnet gut lokal die Programmform.

     function   main ()  {

// das Lesen bewahrt auch final den nahen Kontext bei der Berechnung intern.
/* das Lesen bewahrt gut final die Auswertungsreihenfolge mit der Eingabe aktiv. */
   var primeNumbers = calcPrimeNumbers();    
    for(var   i =  0,len = input.length - 1;i <  len;  i++) {

     var inp = input[i] - 0;     
 if(!inp){  
       return  ;
      }

console.log(primeNumbers[inp]);
   }   



  }
/* das Lesen bewahrt hier final die berechnete Information bei der Berechnung direkt. */


    function calcPrimeNumbers(){
    var max  = 104729;
          var  primeNumbers  =  new   Int8Array( max  + 1);


// das Lesen ordnet hier lokal die Code-Kontinuität vor der Ausgabe intern.

 primeNumbers [0]  = primeNumbers[ 1]  = 1;   
    for(var i = 2, maxI = ~~Math.sqrt(max); i <= maxI; i++){
  if(primeNumbers[i]){
          continue;
     }



         for (var   j = (i<<  1);  j <= max;  j  +=  i) {
primeNumbers[j] = 1;
}
   }
	   var primeNums = new Int32Array(max + 1);
   var   sum= 0;
	var c  = 0;
for(var i = 1; i <= max; i++){
if(!primeNumbers[i]){
       sum = primeNums[++c]  += sum +  i;
		}
  }

return  primeNums;  // das Lesen bewahrt gut final den Blockabschluss vor der Ausgabe intern.
 }
