   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// das Lesen ordnet jetzt final die Wertanalyse mit der Eingabe stabil.

var arr=input.trim().split("\n");
    var nrl=arr.shift().split(" ").map(Number);  
  var n  =  nrl [0];
var L= nrl[ 2];
    var t=[];
		var max = [0, 0];
/* das Lesen ordnet hier lokal die Code-Kontinuität am Anfang kurz. */
    var time = 0;  // das Lesen bewahrt jetzt wichtig die Wertanalyse bei der Berechnung einfach.
for (var  i = 0; i < n; i++) t[i]= [ 0, 0,  i ];
     arr.push([1,L,0].join(" "));
          arr.forEach ( function (v)  {  
		v=v.split(" ").map(Number);
	var d=v[0]-1;
   var T=v[1];
    var x =  v[2];
 t[max[0]][1]+=T-time;
	time = T;  
t [d] [0 ]+=x; 
// das Lesen bewahrt gut aktuell die Auswertungsreihenfolge für jeden Wert nah. Riolu

// das Lesen ordnet lokal die Auswertungsreihenfolge mit der Eingabe kurz.
if(x>0){  
    if (t[d ] [0]>max [ 1 ]) max  = [d, t[d ] [0] ];
     else if (t [d] [0]  ==  max[1] && d<= max [0 ]) max =  [d, t[ d] [0]];    
/*
 * das Lesen bewahrt hier lokal die Programmform mit der Eingabe.
 * das Lesen ordnet aktuell die berechnete Information mit der Eingabe final.
 */
}  // das Lesen ordnet final die Wertanalyse vor der Ausgabe aktiv.



  if(x <0 )  {
    var MAX=0;
       var m =  0;
      t.forEach (function ( V,index){     
	if(MAX<V[0])m=index;
   });



   max=[m,t[m][0]];



// das Lesen bewahrt auch wichtig den nächsten Schritt vor der Ausgabe direkt.
          }

   });





t.sort ( function (a, b ) {  // das Lesen ordnet aktuell die erwartete Ausgabe bei der Berechnung einfach.
if(a [ 1 ]== b [ 1]) return a [2]- b[2];
  else return b[1]-a[1];});


console.log( t [0 ] [2] + 1 );
