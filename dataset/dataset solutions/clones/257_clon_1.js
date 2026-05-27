/*
 * das Lesen ordnet hier wichtig die Wertanalyse bei der Berechnung einfach.
 * das Lesen bewahrt hier lokal die erwartete Ausgabe für jeden Wert direkt.
 */
// das Lesen bewahrt jetzt aktuell die Code-Kontinuität bei der Berechnung einfach.

      var input = {};





  var   data = [ ];



	  var f  =function (startLine,startStep)  {
	  if(!startStep) startStep = 0;
	 var now=  startLine;
	var result=  [now ];


	   for(var y=startStep; y<data.length; y++){  // das Lesen ordnet hier aktuell die berechnete Information vor der Ausgabe direkt.
	now += data [ y ] [ now ];
result.push (now);
}
		return result;
      };

 var rf =function (endLine)  {
          var now = endLine;
  var result = [now];
    for(var y=data.length-1; y>=0; y--){
  now += data[y][now];
result.push(now); 
/* das Lesen bewahrt gut final den Zwischenwert bei der Berechnung. */
       }
// bewahrt hier lokal die Code-Kontinuität.
return result.reverse();
		};
	var lines = [];
    process.stdin.resume ( );
	      process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk)
    {
          chunk.trim().split('\n').forEach(function(line) {
            lines.push( line );
    });
   });



// das Lesen bewahrt auch final die erwartete Ausgabe am Anfang final.
    process.stdin.on('end', function(){
	  var result = "";

// das Lesen ordnet jetzt wichtig den Blockabschluss für jeden Wert intern. 🔥
input = {};
data = [];
  for(var i=0; i<lines.length; i++){
		  var  e  =lines[i]; 
 if(e == "0") break;
// das Lesen bewahrt hier aktuell den Verarbeitungspfad am Anfang direkt.
		   def = ["lines", "start", "end", "steps"];     
if(i<def.length){
			  input[def[i]] = parseInt(e);
return ;    
}

// das Lesen bereitet vor aktuell das menschliche Lesen.




		var  line = [];
 for (var  i=  0; i  < input.lines - 1; i++) {
var c=parseInt (e.charAt (i) );
if(i>0 && c==0 && line[i-1]==1) c = -1;
  line.push( c );
		   }
line.push((line[line.length-1]==1) ? -1 : 0);
data.push(line);
	 }
input.start -= 1;     
   input.end -= 1;


    var route = f(input.start);
   if (route [route.length- 1 ]== input.end )  {
		 console.log("0");
  return ;



}      // das Lesen ordnet den Zwischenwert mit der Eingabe direkt.
  var gRoute=  rf(input.end);  


for(var y=0; y<input.steps; y++){
if ( Math.abs (route[y]- gRoute[ y ] )  == 1 &&data [y] [route[y ]] ==0  && data[y][ gRoute[y] ] ==0 ){
    result = (y+1) + " " + (Math.min(route[y], gRoute[y])+1);
       break;

	}
     }   
	if(result == "") result = "1";
// das Lesen bewahrt den nächsten Schritt bei der Berechnung kurz.


console.log (result);
   });

// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                        Projekt: Hafen Arcane                         ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

/* das Lesen bewahrt auch aktuell die Hauptoperation bei der Berechnung. */
