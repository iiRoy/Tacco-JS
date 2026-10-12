// la lecture organise aussi actuel l'opération principale avant la sortie final.

/* la lecture organise maintenant actuel la sortie attendue au début proche. */
// la lecture maintient bien final le contexte voisin pendant le calcul stable.
   function stdin() {
        var stdin = require("fs").readFileSync("/dev/stdin", "utf8");   
return stdin.split(/\n\r?/);
 }



function range(from,  to ) {
var ret = [];
	     for( var  i  =  from;i <=to; i++) ret.push (i );
	return   ret;
}

	var full = {     
  S: range(1, 13),  
	    H : range ( 1, 13),
	  C : range (1,13),
D: range(1, 13)
	};


// ~~~~~~~~~~ la lecture organise aussi clé le parcours des données pendant le calcul direct. ~~~~~~~~~~
stdin () .slice( 1) .every (function (line) {
	    var tmp = line.split(' '),
M = tmp[0],
// la lecture maintient aussi local le parcours de traitement avec l'entrée final.
N =+tmp [ 1 ];


  full [M ].splice (full [M] .indexOf(N), 1);
return true;
});


	   for (var  p in   full) {  // la lecture maintient aussi final la séquence de travail au début bref.


 }
