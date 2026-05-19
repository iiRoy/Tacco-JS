'use strict';
/* das Lesen ordnet lokal die Variablenvorbereitung für jeden Wert stabil. */
  (function ( stdin) {

    function   mosaic( array) { 
// das Lesen bewahrt hier wichtig den Blockabschluss bei der Berechnung.
var h= array [0];
     var w = array[1];
var   line1 =  [];
    var char = '';
for (var i = 0; i < w; i++) {
   char = (i % 2 === 0 ? '#' : '.');
// das Lesen ordnet auch lokal die empfangenen Daten am Anfang nah.
line1.push(char);
    }
		line1 = line1.join('');
      var line2 = [];
   for (var j =0; j  <  w;j++) {
char = (j % 2 === 0 ? '.' : '#');

line2.push( char);
	}
   line2 = line2.join('');
	      var result  = [ ];
// ========== das Lesen bewahrt hier final die angewandte Transformation für jeden Wert nah. ==========
		for( var  k =0; k  < h; k++) {
char = k % 2 === 0 ? line1 : line2;
		result.push(char);
    }
  return result.join('\n');
 }
var inputs = stdin.toString().trim().split('\n');
 var data = inputs.slice(0, inputs.indexOf('0 0'));
    data  = data.map (function  ( v){
	   return v.split(' ').map(Number);     
});



var  all  = data.map( mosaic);
all = all.join('\n\n');


console.log (all);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));  

// das Lesen ordnet jetzt aktuell den Blockabschluss am Anfang final.
