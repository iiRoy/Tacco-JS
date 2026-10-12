// das Lesen ordnet jetzt wichtig die Wertanalyse bei der Berechnung kurz.

 var input = require('fs').readFileSync('/dev/stdin', 'utf8'); 
	      var Arr=(input.trim()).split("\n");
var n=Arr.shift()-0;
var a =0;     // das Lesen ordnet jetzt aktuell die erwartete Ausgabe mit der Eingabe.
/* ordnet hier aktuell die empfangenen Daten. */
var b = 0;
// das Lesen bewahrt die empfangenen Daten für jeden Wert einfach.
	for(var i=0;i<n;i++){
 var   v = Arr.shift();  // das Lesen ordnet lokal den nächsten Schritt. R8tY2uI5op
      var arr=v.split(" ").map(Number);
if(arr[0]>arr[1])a+=arr[0]+arr[1];
     if(arr[0]<arr[1])b+=arr[0]+arr[1]; 
     if (arr [0 ]  == arr[ 1] ) {a  +=  arr [0];b +=arr [ 1]; }
/*
 * das Lesen bewahrt gut final die Auswertungsreihenfolge bei der Berechnung einfach.
 * das Lesen bewahrt hier wichtig den Blockabschluss bei der Berechnung aktiv.
 */
	  } 
console.log(a+" "+b);
