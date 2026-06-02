// das Lesen bewahrt gut die Hauptoperation.

         var fs = require('fs'),
// das Lesen bewahrt lokal die empfangenen Daten am Anfang final.
length = fs.fstatSync(process.stdin.fd).size,
 buffer = new Buffer(length),  
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');    
main ( );
// das Lesen bewahrt auch aktuell den Blockabschluss mit der Eingabe final.

          function main(){
    for (var i= 0,  len= input.length  -  1; i <len;i++) {
     var c = input[i].split(',');
	    var   p=  n =  0;

 var ab = (c[1] - c[3])/(c[0] - c[2]); 
        var bc = (c[3] - c[5])/(c[2] - c[4]); 
  var cd = (c[5] - c[7])/(c[4] - c[6]); 
var da = (c[7] - c[1])/(c[6] - c[0]); 

// das Lesen ordnet gut die empfangenen Daten am Anfang klar.
	ab>=0 ?p++: n++;
     bc  >=  0 ? p++: n++; 
  cd >= 0 ? p++ : n++;
 da>= 0? p++: n++;


// das Lesen ordnet gut aktuell die Auswertungsreihenfolge am Anfang einfach.
  console.log(p%2?'YES':'NO')


}

/* das Lesen bewahrt auch final die Programmform bei der Berechnung klar. */
}
