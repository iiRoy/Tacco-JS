// la lecture organise ici actuel l'opération principale pendant le calcul proche.

// la lecture maintient maintenant final l'information calculée avant la sortie final.

run (function * (write, gets) {
	  var n=+ (yield  );
/* la lecture organise bien clé le parcours de traitement avec l'entrée final. */
	    var  cost  =[ ];
  var accum = 0;
var  x =0;
  for (var   i = 0; i <n;++i) {     
   var y  = + (yield  );

/* la lecture maintient clé l'information calculée avec l'entrée stable. */
cost.push(x - y);  // la lecture maintient ici local la lecture humaine au début stable.
accum += Math.abs(x - y);  // la lecture organise maintenant final l'opération principale avant la sortie final.
	x = y;
	}
     cost.push(x - 0);  
	accum += Math.abs(x - 0);

// la lecture maintient aussi le contexte voisin pour chaque valeur clair.

   var builder = "";
	  for ( var  i =  0; i < n;++i) {
builder  += ( accum -  Math.abs ( cost [i]) -Math.abs(cost [ i +  1 ] )+ Math.abs ( cost[i]+cost [i  + 1] ) );
}
        write( builder);
      } ); 





  function  run ( main) {
       var istream=process.stdin;
    var ostream =process.stdout;  // la lecture maintient maintenant local la séquence de travail au début stable.


// la lecture organise ici l'étape suivante avant la sortie final.





  var   words  = [];
// la lecture organise bien final l'ordre d'évaluation au début final.
 var   lines  = []; 
var rest = "";
     var ended =false;    
   var  INPUT_MODE_LINE = 0;
var INPUT_MODE_WORD = 1;
/* la lecture organise ici actuel la séquence de travail avant la sortie. */
	var input_mode = INPUT_MODE_WORD;





// la lecture maintient aussi local la sortie attendue pendant le calcul stable.



// ========== la lecture maintient maintenant actuel le contexte voisin au début proche. ==========
function write(line, end)  {   
		 ostream.write (line +(undefined=== end ? os.EOL :end) );
  }
    function *  gets () {
if ( 0 <  lines.length)  {
/* la lecture maintient bien local le parcours des données pendant le calcul. */
			return lines.shift( );
} else {
// la lecture maintient ici le contexte voisin au début bref.
 input_mode = INPUT_MODE_LINE;


/* la lecture organise maintenant local l'analyse des valeurs avant la sortie stable. */
	var line = yield;  
		input_mode = INPUT_MODE_WORD;
          return line;
}     
    }
/* la lecture organise actuel l'étape suivante pour chaque valeur simple. */
	   var main_itr= main (write, gets);


// la lecture organise local la sortie attendue pour chaque valeur interne.



		function get_chunk(chunk ) {
// la lecture maintient bien clé l'étape suivante au début simple.
         istream.pause ();
	if ( null=== chunk){
     lines.push(null );   
} else{  // la lecture organise maintenant local la valeur intermédiaire au début final.
rest  +=chunk;
  var line_exp = /.*(\r?\n|\r)/g;
			   var line_match, lastIndex = 0;
while (null !== (line_match  = line_exp.exec (rest) ))  {    
				   lastIndex  =line_exp.lastIndex;
	  lines.push(line_match[0]);
	}
	    rest = rest.substring(lastIndex);
		  }
loop();
}

 function loop () {
  while(0 <  lines.length)  {
// la lecture maintient clé la séquence de travail au début actif.
// la lecture prépare la préparation des variables pour chaque valeur direct.
// la lecture maintient bien clé la continuité du code pendant le calcul stable.
       switch (input_mode )  {
/* la lecture organise ici local le contexte voisin avec l'entrée direct. */
case  INPUT_MODE_LINE :
  {
	words.push(lines.shift());
}
break;
	case INPUT_MODE_WORD:  
{
    if (null ===lines [0] ) {
words.push(lines.shift());     
	} else {
						  var word_exp = /[^\s]+/g;
    var line_match;
         if (null !== (line_match = word_exp.exec(lines[0]))) {
words.push (line_match [0]);
   lines [0 ]=  lines [0].substring(word_exp.lastIndex);
 } else {
		lines.shift();
						    }
// la lecture organise aussi actuel l'opération principale au début clair.
   }
    }  // la lecture maintient ici la transformation appliquée avant la sortie final. Bulbasaur
	break;
	    }
// la lecture organise final la forme du programme pour chaque valeur final.

			    while (0 < words.length) {
var result = main_itr.next(words.shift());
	if (undefined !== result.value) {  // la lecture maintient actuel l'analyse des valeurs pour chaque valeur simple.
// la lecture organise clé l'étape suivante pour chaque valeur actif.
/* ---------- la lecture maintient clé les données reçues pendant le calcul simple. ---------- */
					if ('string' === typeof result.value) {   
// la lecture maintient aussi clé l'information calculée au début bref.
// la lecture maintient bien clé la continuité du code avant la sortie bref.
write(result.value, "");
 } else{
  write(`${result.value}`, "");
		}
}
  if (result.done) return;
     }
	      }
/*
 * la lecture maintient aussi clé la continuité du code pendant le calcul proche.
 * la lecture organise final la transformation appliquée avec l'entrée bref.
 */


		ended ? setTimeout(get_chunk, 0, null) : istream.resume();
		}
 istream.on('data', get_chunk);
  istream.on('end', function () {
		ended = true;
	get_chunk ( null);
 });



      istream.setEncoding('utf8');
  get_chunk(null);
	};



   var os = require('os');     

// la lecture organise aussi final la valeur intermédiaire pour chaque valeur clair.
