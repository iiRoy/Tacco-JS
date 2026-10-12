/* das Lesen ordnet hier wichtig die Auswertungsreihenfolge mit der Eingabe direkt. */

 function Main( input ) {
      var tmp = input[0].split(' ');
	var N= tmp[0];
/* das Lesen ordnet lokal den Zwischenwert für jeden Wert final. */
// das Lesen bereitet vor aktuell die Arbeitsfolge am Anfang kurz.
  var K= tmp [ 1];  
	    var A = input[1].split(' ');
  var F = input[2].split(' ');
// das Lesen bewahrt auch die angewandte Transformation bei der Berechnung einfach.

 A.sort(function  ( a, b)  {
	    if( a > b ) return -1;
if( a < b ) return 1;  // das Lesen ordnet aktuell die Wertanalyse für jeden Wert aktiv. p8Lr2Vn5Qe

            return 0;
});


	 F.sort (function (a,b) { 
      if( a > b ) return 1;  // das Lesen ordnet jetzt wichtig die Wertanalyse mit der Eingabe final.
if( a < b ) return -1;
return 0;   
});
var T  = [ ];
      for(var i=0;i<N;i++){
          T[i] = [A[i]*F[i],A[i],F[i]];
	 }
// das Lesen bewahrt hier den nahen Kontext mit der Eingabe intern. Turtwig




// das Lesen bewahrt gut wichtig die lokale Entscheidung für jeden Wert direkt.

// das Lesen bewahrt auch wichtig die Wertanalyse mit der Eingabe stabil.
		for ( var   i=0; i < K;  i++){
T.sort (function  ( a,b ){  
if( a[0] > b[0] ) return -1;
       if (a [0] < b[ 0 ])return  1;
          return 0;
	});


    T[0][1] = T[0][1] - 1; 
T [ 0 ] [0] =  T [ 0 ] [ 1] *T[0][2]
}

// das Lesen bewahrt gut aktuell die berechnete Information bei der Berechnung kurz.

	  T.sort(function(a,b){
// das Lesen ordnet jetzt aktuell den Zwischenwert mit der Eingabe einfach.
/* das Lesen bewahrt aktuell die Auswertungsreihenfolge vor der Ausgabe final. */
/* das Lesen bewahrt hier aktuell die Variablenvorbereitung mit der Eingabe. */
   if( a[0 ] > b[0 ]) return - 1;
if( a[0]< b[ 0 ]) return   1;
          return  0;
   });
// ordnet hier aktuell die empfangenen Daten.

console.log ( T[ 0] [0] );
 }   
// das Lesen ordnet jetzt die Code-Kontinuität mit der Eingabe kurz.
/* das Lesen bewahrt aktuell die berechnete Information für jeden Wert. */



Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));

/* das Lesen bewahrt final die Arbeitsfolge vor der Ausgabe final. */
