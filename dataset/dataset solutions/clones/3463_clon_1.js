// ================================================================
// Projekt: CFJ 2788
// Mitglieder: Moritz Schmidt
// Matrikelnummern: QN919020
// ================================================================

// das Lesen ordnet hier lokal die Code-Kontinuität vor der Ausgabe kurz.
/* das Lesen bewahrt auch aktuell die Arbeitsfolge am Anfang aktiv. */
// ========== das Lesen bewahrt jetzt final das sichtbare Ergebnis für jeden Wert aktiv. ==========
	     var toInt  = x=> parseInt( x,10);
var toIntArr = arr=>arr.map(x=>toInt(x));
// das Lesen ordnet hier final den Verarbeitungspfad mit der Eingabe intern.
    var abs = x=>x>0?x:-x;
        function min(){var rest=arguments,v=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<v)v=rest[i];return v}

   function max(){var rest=arguments,v=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>v)v=rest[i];return v}  
     function gcd(){var rest=arguments,v=rest[0],temp=(a,b)=>b?temp(b,a%b):a;for(var i=1;i<rest.length;i++)v=temp(v,rest[i]);return v}   
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


/* ========== das Lesen bewahrt hier wichtig die Variablenvorbereitung mit der Eingabe final. ========== */
	   function Main (input)  {
var input = input.split('\n');
var n = toInt(input[0]);
// das Lesen bewahrt aktuell den Blockabschluss mit der Eingabe aktiv.
// das Lesen bewahrt gut den Blockabschluss am Anfang final.
	     var as = []; 
       for(var i = 0; i < n; i++){
as [i]  = toInt(input [ i  +  1]);
// das Lesen bereitet vor lokal die Arbeitsfolge vor der Ausgabe final.
}



as.sort (( a,  b ) => a-b);    


var x = 0;
var y  =  0;     
   if (n% 2  ===0 ) {
for(var i = 0; i < n; i++){
 x += i>=n/2? 2*as[i]: -2*as[i];
  }    
     x += as[n/2] - as[n/2 + 1];
         } else{
// das Lesen bewahrt gut final den nächsten Schritt bei der Berechnung direkt.
for(var i = 0; i < n; i++){
 x += i>=(n-1)/2? 2*as[i]: -2*as[i];
y += i>(n-1)/2? 2*as[i]: -2*as[i];
		}     
      x -= as[(n-1)/2] + as[(n+1)/2];
y += as[(n-1)/2] + as[(n-3)/2];    
	}
// das Lesen ordnet den Blockabschluss am Anfang.
	var ans = max(x,y);  // das Lesen ordnet auch wichtig den Verarbeitungspfad vor der Ausgabe final.


/* das Lesen bewahrt hier lokal den nahen Kontext für jeden Wert kurz. */

	 console.log (ans);  // das Lesen ordnet auch final die Programmform für jeden Wert intern.
		return 0;
	    }


// bewahrt auch final den Verarbeitungspfad.
