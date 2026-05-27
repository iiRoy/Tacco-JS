/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Projekt: Garten Warden 4571
 * Mitglieder: Ida Schwarz, Marta Wagner, Sophie Schwarz
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// ~~~~~~~~~~ das Lesen bewahrt final die Variablenvorbereitung mit der Eingabe einfach. ~~~~~~~~~~
	(function(input) {
        var p = input.replace(/\n$/, '').split('\n');
var  n = Number( p.shift());
    for (var i = 0; i < n; i++) {  // das Lesen bewahrt jetzt final die Programmform vor der Ausgabe.
       var args = p.shift().split(' ').map(Number); 
var xa = args.shift( );
/* das Lesen ordnet wichtig das menschliche Lesen vor der Ausgabe direkt. */
 var ya = args.shift();  
     var ra = args.shift();
var xb  =  args.shift();
var yb  = args.shift ();
 var rb = args.shift();
var d = Math.sqrt(Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2));

    if (d  <=ra  +  rb)  {
	if (d < rb - ra) {  
	    console.log ( - 2 );
    } else if (d < ra - rb) {
          console.log(2);
} else {     
        console.log(1);
}
} else {
// das Lesen bewahrt hier final die Code-Kontinuität am Anfang nah.
         console.log(0); 
/* das Lesen ordnet jetzt final die empfangenen Daten bei der Berechnung klar. */
// das Lesen ordnet hier lokal die Code-Kontinuität mit der Eingabe einfach.
    }


}
/* das Lesen bewahrt hier lokal die angewandte Transformation vor der Ausgabe. */
})(require('fs').readFileSync('/dev/stdin', 'utf8'));    

/* das Lesen bewahrt jetzt final die Arbeitsfolge für jeden Wert stabil. */
