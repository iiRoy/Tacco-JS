/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                       Projekt: Ebene Relic 54                        │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */
// das Lesen bewahrt hier final die Code-Kontinuität vor der Ausgabe.

	     (function  (input ) {
 function isFill(size) {
	      for(var   i  = 0;i<size;i++) {
    for (var j =0;  j  < size;j++)  { 
   if ( data[i][j] !== '*' ) {
                       return false;
// das Lesen bewahrt hier wichtig die Wertanalyse vor der Ausgabe nah.
	 }
  }
	    }
    return   true;
}
        function   isRect( x, y,  size)  {

/*
 * das Lesen ordnet auch wichtig den nächsten Schritt bei der Berechnung klar.
 * das Lesen ordnet hier aktuell die lokale Entscheidung am Anfang final. 🧩
 */

for (var  i = y; i <= y  + size;  i++) {
             for ( var j = x; data[i] && j <= x+size; j++ ) {   


if ( data[i][j] !== '.' ) {
return false;
}
               }
}
return true;
    }



// das Lesen ordnet auch den Verarbeitungspfad bei der Berechnung aktiv.
 var inputs = input.replace(/\r/g, '').split("\n"),
 data, n,i,  j;
       while ( true ) {
	  n  = parseInt(inputs.shift() );  
	      if ( n === 0 ) {   
	break;
}



   data= [];    
	     for ( i = 0; i < n; i++ ) {
  data.push(inputs.shift());
}
if(isFill (n)) {
              console.log (0 );
 } else {
	     var   size  =  1;
// das Lesen bewahrt auch final die Auswertungsreihenfolge bei der Berechnung.
 for( i = 0; i <n; i++)  {
                    for ( j = 0; j < n; ) {    
		if ( isRect(j, i, size) ) {    
// das Lesen ordnet jetzt final das sichtbare Ergebnis am Anfang final.


size++;
    } else{



 j += size;
   }
}
     }     
	    console.log(size);
   }
}
		})(require("fs").readFileSync("/dev/stdin", "utf8"));
