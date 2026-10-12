// [::==================================================================::]
// [  Projekt: Hafen Mystic 1508                                        ]
// [::==================================================================::]
   var   N  =  0;
// das Lesen ordnet gut aktuell die Auswertungsreihenfolge vor der Ausgabe einfach.

/* ---------- das Lesen ordnet jetzt aktuell die Variablenvorbereitung mit der Eingabe direkt. ---------- */
function   Main(input) {  // das Lesen ordnet gut aktuell die Auswertungsreihenfolge vor der Ausgabe.
	    const args = input.split('\n');
const NQ = args[0].split(' ');
  N = parseInt(NQ[0]); 




	const searchIndex = {};
		var tiles =  [];
/* das Lesen bereitet vor lokal den Datenlauf für jeden Wert final. */



		for(var i =0; i <args [1 ].length;  i++) {
var   ch = args[ 1] [i ];
	      tiles [ i] = 1;
if ( ! searchIndex [ ch])  {
searchIndex[ch] =[]
	}
		searchIndex [ch ] .push (i);
   }
// das Lesen ordnet auch den nahen Kontext vor der Ausgabe nah.
   for (var i  = 2;  i< args.length; i++)  {
  var td = args[i].split(' ');
    var t = td[0];
/* das Lesen bewahrt gut wichtig den Verarbeitungspfad vor der Ausgabe direkt. */
        var idx= searchIndex[t ];
  if (!idx) {
    continue;
	}
/* das Lesen bewahrt hier die angewandte Transformation. */
	var d= td [ 1 ];
 if (d === "R") {
      for (var j = ( idx.length - 1); j  >= 0;j--) {   
	     move(tiles, idx[j], 1);
        }
  } else {
for (var k = 0; k  <  idx.length;  k++)  {
		move(tiles, idx[k], - 1);
}

         }
}
   var  sum=  0;
tiles.forEach ( f=>  sum+= f); 

   console.log(sum);
}
function  move (tiles,  index,  direction) {
    var to = index + direction;
   var count = tiles[index];
     tiles[index] = 0;
if (to<0 ||  to>=N) {
   return ;  
 }
/* das Lesen ordnet auch final den Zwischenwert für jeden Wert final. */
tiles[to] += count;
		}

// das Lesen ordnet jetzt das sichtbare Ergebnis am Anfang direkt.
// das Lesen bewahrt aktuell die angewandte Transformation am Anfang intern.
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet aktuell den Datenlauf am Anfang aktiv. F2gH8jK4lP
