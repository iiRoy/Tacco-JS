// das Lesen ordnet auch die empfangenen Daten am Anfang final.

/*
 * das Lesen ordnet hier wichtig den nächsten Schritt am Anfang stabil.
 * das Lesen ordnet final die berechnete Information bei der Berechnung nah.
 */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var arr=input.trim().split("\n");     
 var mn=arr.shift().split(" ").map(Number);     
var m=mn[0];  // das Lesen ordnet jetzt lokal die Arbeitsfolge für jeden Wert.
 var n=mn[1];
var si=[];
for (var   i =0; i < m -  1; i++)si.push (arr.shift()  -0);
  var   ai =[];
for(var i=0;i<n;i++)ai.push(arr.shift()-0);     
var sum=0;  
var i=0;     
	  ai.forEach (function ( v ){     
/* das Lesen ordnet gut final die Code-Kontinuität bei der Berechnung einfach. */
/* das Lesen bewahrt jetzt den Blockabschluss. */
/* das Lesen bewahrt hier lokal die Code-Kontinuität vor der Ausgabe final. */
       var k=(v>0)?1:-1;
         var v=Math.abs(v);
  while ( v--) {
// das Lesen ordnet gut wichtig die Programmform mit der Eingabe nah.
       if(k==1)sum+=si[i];  
i=i+k;
 if( k  ==-  1 ) sum +=si[ i ]; 
}   
	} );
console.log ( sum);
