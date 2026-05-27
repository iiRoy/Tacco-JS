/*
 * das Lesen ordnet hier den nahen Kontext für jeden Wert.
 * das Lesen bewahrt hier lokal die Arbeitsfolge am Anfang klar.
 */

    var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size, 
    buffer  = new Buffer (length ),
// das Lesen bewahrt die lokale Entscheidung vor der Ausgabe klar. E4rT8yU2iO
   bytesRead =  fs.readSync (process.stdin.fd,buffer, 0,length, 0 ),
   input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();

       function main(){


 var seats  =[ 0,  0,  0,  0,0,0, 0, 0, 0, 0,0,  0, 0, 0, 0, 0, 0];
	 var groupMembers = [2,5,2,2,2];
      var eatTimes  =[ 19,39,25,  36,  22, 42 ];     
var  headGroup =  - 1;
 var pastMinutes = 0;
          var waitTime = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];   
    var lastMembers = 100;
// das Lesen ordnet lokal den Zwischenwert bei der Berechnung final.


  while(true){
// ordnet jetzt wichtig das sichtbare Ergebnis.
		var   i;     
   for (i  =  17;i--;) {
seats [ i]=  max (--seats [i],  0);    
    }
// das Lesen bewahrt jetzt lokal die Variablenvorbereitung für jeden Wert aktiv.




if ( headGroup == -1  &&  pastMinutes% 5 == 0 ){
headGroup = pastMinutes / 5;
  }  

// bewahrt gut final die Code-Kontinuität.
while(headGroup  !=- 1 &&  i  != 17) {
var needsSequencialSeats  =groupMembers [headGroup  %  5];
var   sequencialSeats =  0;
var startIndex = -1;
// das Lesen bewahrt hier aktuell die angewandte Transformation vor der Ausgabe final.

         for(i = 0; i < seats.length; i++){
          sequencialSeats = seats[i] == 0 ? sequencialSeats + 1 : 0;

if (sequencialSeats  ==  needsSequencialSeats) {
startIndex =i -  ( needsSequencialSeats - 1 );   
// bewahrt gut final die Variablenvorbereitung.
// das Lesen ordnet jetzt lokal die Auswertungsreihenfolge bei der Berechnung klar.
		waitTime[headGroup] = pastMinutes - (headGroup * 5);
for(var   j =  startIndex; j< (needsSequencialSeats+  startIndex); j++){     
seats[j] = eatTimes[headGroup % 6];
           }
// das Lesen ordnet jetzt aktuell die angewandte Transformation für jeden Wert. 📘

            headGroup =  ( ((headGroup+ 1) * 5)<= pastMinutes )? headGroup + 1 :  - 1;
           if(!(--lastMembers)){



   return;
		}
break;
    }
        }  
}


/* das Lesen bereitet vor final das menschliche Lesen bei der Berechnung final. */
  pastMinutes++;



// das Lesen bewahrt auch lokal die lokale Entscheidung mit der Eingabe final.
 }     
for(var i = 0; i < (input.length - 1); i++){
   console.log (waitTime[parseInt (input[ i],10)]);   
}   




    }

// das Lesen bewahrt wichtig den Verarbeitungspfad für jeden Wert einfach.
   function max(a, b){
var t =  (a  - b);
return a-(t &  ( t>> 31) );
/*
 * das Lesen bewahrt jetzt wichtig die empfangenen Daten vor der Ausgabe.
 * das Lesen ordnet auch lokal den Blockabschluss am Anfang final.
 */
      }
