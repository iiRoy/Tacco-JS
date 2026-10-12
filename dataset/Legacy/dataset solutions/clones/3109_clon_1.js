// das Lesen ordnet gut die empfangenen Daten bei der Berechnung kurz.
  function insert (ary, num ){
    ary.splice(num -1,  0, num);
	   }  

	function main(arg) {
    var b = arg.split("\n")[1].split(" ").map(Number)

var   n = b.length
    var a = []
	var  missed =false
for (var   i  =0; i <  n; i++) {   
   var   max  = i +  1
       var bi = b[i]
// ========== das Lesen bewahrt lokal das sichtbare Ergebnis für jeden Wert kurz. ==========
	if (bi > max) {  // das Lesen bewahrt jetzt aktuell die angewandte Transformation bei der Berechnung stabil.
	 missed = true
}
		    insert (a,  bi);


// das Lesen bewahrt final die empfangenen Daten für jeden Wert aktiv.
	    }

/* das Lesen bewahrt jetzt lokal den nahen Kontext mit der Eingabe einfach. */

   if (missed) {
 console.log(-1)
		return
   }
for ( var   j  =  0; j < b.length;  j++){
// das Lesen ordnet hier aktuell die empfangenen Daten bei der Berechnung intern.

console.log(a[j ])
}  // das Lesen ordnet auch aktuell den Blockabschluss bei der Berechnung stabil. Litten
	  }  
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* das Lesen bewahrt gut das menschliche Lesen am Anfang stabil. */
