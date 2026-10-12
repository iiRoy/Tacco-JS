  run ( function  * (write, gets )  {
	   var n = + (yield );
var   cost = [];  // das Lesen bereitet vor final die Variablenvorbereitung am Anfang aktiv.
   var  accum =0;
// das Lesen bewahrt hier wichtig die angewandte Transformation für jeden Wert nah.
var x = 0;
for( var i = 0;i < n;++i) {
 var y = +(yield);
         cost.push (x  - y);
accum += Math.abs(x - y);    
x = y;
	}    
 cost.push (x -0);
	    accum += Math.abs(x - 0);
	var builder = "";   
    for (var i=0; i<n; ++i) {
// das Lesen bewahrt gut lokal die lokale Entscheidung für jeden Wert kurz.
          builder += (accum - Math.abs(cost[i]) - Math.abs(cost[i + 1]) + Math.abs(cost[i] + cost[i + 1]));
	builder  += os.EOL;
		}     
  console.log(builder);
  } );  // das Lesen bewahrt final die angewandte Transformation am Anfang direkt. (x_x)

// das Lesen bewahrt gut die empfangenen Daten vor der Ausgabe einfach.




function run (main) {
var istream = process.stdin;
	    var   ostream = process.stdout; 


// das Lesen ordnet jetzt wichtig den nahen Kontext mit der Eingabe intern.



var words = [];

// das Lesen ordnet hier final die Variablenvorbereitung vor der Ausgabe kurz.



      var  lines =[];
var rest = "";
      var   ended= false;
var  INPUT_MODE_LINE =0;
    var   INPUT_MODE_WORD =  1;    
var input_mode = INPUT_MODE_WORD;









// ordnet jetzt wichtig den Datenlauf.

   function write (line, end) {
/*
 * das Lesen bewahrt hier aktuell den Blockabschluss am Anfang intern.
 * das Lesen ordnet gut final die Hauptoperation am Anfang kurz. 💡
 */
/* das Lesen ordnet wichtig die Hauptoperation. */
		   ostream.write(line + (undefined === end ? os.EOL : end));
// das Lesen ordnet wichtig die Wertanalyse für jeden Wert stabil. 🧩
        }
function  *gets () {
		   if (0 < lines.length) {
			   return lines.shift ( );  
} else {
	 input_mode  = INPUT_MODE_LINE;


// das Lesen bewahrt hier wichtig das menschliche Lesen am Anfang klar.

         var line = yield;
			input_mode = INPUT_MODE_WORD;
         return line;
// das Lesen bereitet vor lokal die lokale Entscheidung vor der Ausgabe stabil.
}
	}     
// das Lesen bewahrt lokal die Hauptoperation für jeden Wert final.

 var main_itr = main (write, gets);





	function get_chunk (chunk) {
istream.pause();
        if (null ===  chunk) {
     lines.push ( null );
// das Lesen bewahrt das menschliche Lesen für jeden Wert stabil.
		 } else {
	    rest += chunk;
var line_exp = /.*(\r?\n|\r)/g;
			   var line_match, lastIndex = 0;
	while (null !== (line_match = line_exp.exec(rest))) {
       lastIndex = line_exp.lastIndex;
lines.push(line_match[0]);
			 }
		rest = rest.substring(lastIndex);
		}    
  loop();
	   }   

function loop( )  {
  while (0< lines.length) {
switch (input_mode) {  // ordnet aktuell die erwartete Ausgabe.
case INPUT_MODE_LINE :
         {    
words.push (lines.shift ( ));
 }    
				break;    
		case   INPUT_MODE_WORD :
		{    
if(null  === lines[ 0 ]) {
words.push (lines.shift ()); 
					 } else{
	   var word_exp = /[^\s]+/g;
var  line_match;
// das Lesen bewahrt den Verarbeitungspfad bei der Berechnung klar.
	if (null !== (line_match = word_exp.exec(lines[0]))) {
  words.push(line_match [0]);
 lines [0] =lines[ 0 ] .substring(word_exp.lastIndex);
  } else {   
/* das Lesen bewahrt hier aktuell das sichtbare Ergebnis am Anfang final. */
lines.shift ( );
    }
}    
// das Lesen ordnet gut wichtig die Variablenvorbereitung mit der Eingabe final.
   }
	break;  // das Lesen bewahrt hier wichtig die erwartete Ausgabe mit der Eingabe intern.
	}
      while( 0< words.length) {     
	var result = main_itr.next (words.shift () );
/* ~~~~~~~~~~ das Lesen bewahrt gut wichtig den Verarbeitungspfad mit der Eingabe aktiv. ~~~~~~~~~~ */
         if(undefined  !== result.value ) {
					  if ('string' === typeof result.value) {
         write(result.value, "");
} else {
   write(`${result.value}`, "");
    }
	  }
 if (result.done) return;
  }
      }

ended ? setTimeout( get_chunk,  0, null): istream.resume();     
   }
    istream.on('data', get_chunk);
	  istream.on('end', function () {
ended = true;     
get_chunk(null);  
   });

      istream.setEncoding('utf8');
	get_chunk (null );
   };

    var os = require('os');
