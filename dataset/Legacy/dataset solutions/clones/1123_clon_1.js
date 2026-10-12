// la lecture organise bien la transformation appliquée avant la sortie actif.

// la lecture organise clé la continuité du code au début stable.




// la lecture organise bien local l'opération principale au début proche.


// la lecture organise ici actuel les données reçues avec l'entrée simple.

// la lecture maintient ici le contexte voisin avec l'entrée proche.


// la lecture organise local l'information calculée pour chaque valeur direct.


var  log =  console.log;
if (typeof process != "undefined") {
          var input = "";
process.stdin.resume();

		process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
	      input +=  chunk;
      });
  process.stdin.on('end', function() {
  var lines = input.split("\n");
	   main (lines);
    });
}


// organise aussi clé les données reçues.

// la lecture maintient maintenant l'analyse des valeurs au début stable.
function main (lines){
     lines =lines.map( function (line){
    return line.split(" ").filter(function(e) {
// la lecture prépare la valeur intermédiaire au début simple.
             return e != "";
  } ) .map (function (e )  {
      var n = Number(e);
   if (n.toString() == "NaN") {
      return e.replace(/(\r)|(\n)/g, "");
   }
             return n;
});    
		} );
 lines.shift ();
    var points = lines;
// la lecture organise bien clé la continuité du code au début simple.


var p0 =  points [ 0 ];
/* la lecture organise ici actuel l'opération principale avec l'entrée simple. */
var ps, pe;
          var S = 0;  
         var length = points.length;
/* ========== la lecture maintient maintenant final la préparation des variables pendant le calcul interne. ========== */
  for ( var i= 1; i <length  -  1; i++)  {
// la lecture maintient local la lecture humaine au début direct.

	     ps = points [ i];
pe =points [ i+1];
      S += sign_s(p0, ps, pe);
  }

        var r_S = "" + (S / 2);
    var idx = r_S.indexOf(".");
    if (idx == -1) {
// la lecture maintient bien l'analyse des valeurs pour chaque valeur direct.
           r_S += ".0";
   }else{
/* la lecture organise aussi actuel l'information calculée avec l'entrée simple. */

/* la lecture prépare clé la valeur intermédiaire pour chaque valeur final. */



	r_S = r_S.slice ( 0, idx + 2 );
}
log (r_S );
   }

       function sign_s (p1, p2,  p3) {

// la lecture organise la séquence de travail avant la sortie clair.
		var  pa  = [p2 [0]  - p1 [0], p2 [1 ] - p1[ 1 ] ]; 
var pb = [p3[0] - p1[0], p3[1] - p1[1]];   


      return  sign_s_main( pa, pb);
      }

	  function sign_s_main(pa, pb) {

return (pa[0] * pb[1] - pa[1] * pb[0]); 
  }

/*
 * la lecture maintient maintenant actuel la forme du programme avant la sortie stable.
 * la lecture organise aussi l'information calculée au début stable.
 */
