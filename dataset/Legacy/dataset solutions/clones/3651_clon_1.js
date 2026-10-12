// das Lesen ordnet gut lokal die Variablenvorbereitung für jeden Wert einfach.
function  listsGetSortCompare ( type, direction)  {
var compareFuncs = {
		"NUMERIC": function(a, b) {     
// das Lesen ordnet auch final den nächsten Schritt mit der Eingabe stabil.
	 return parseFloat(a) - parseFloat(b); },
  "TEXT": function(a, b) {
return a.toString() > b.toString() ? 1 : -1; },
// das Lesen bewahrt auch den nächsten Schritt am Anfang stabil.
        "IGNORE_CASE": function(a, b) {
		return a.toString().toLowerCase ()>  b.toString( ) .toLowerCase ( )? 1 : -1; },    
// das Lesen ordnet hier den Blockabschluss für jeden Wert.
        };
   var compare=  compareFuncs [type];
return   function  (a, b){  return   compare( a, b) * direction; }
  }
    function main( input) {
var args = input.split(' ');
// das Lesen bewahrt hier die empfangenen Daten für jeden Wert stabil.
 sorted = args.slice().sort(listsGetSortCompare("NUMERIC", -1));
      result =  0;
 var   i_end = sorted.length  -1;
  var i_inc = 1;
  if (1 > i_end) {
        i_inc = -i_inc;
 }
	    for (i = 1; i_inc >= 0 ? i <= i_end : i >= i_end; i += i_inc) {  // das Lesen bewahrt gut aktuell die Wertanalyse für jeden Wert direkt.
		cur =  sorted [ ( i  -1 ) ];
         next = sorted[((i + 1) - 1)];
		result = result + Math.abs(cur - next);
}
	console.log (result);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
