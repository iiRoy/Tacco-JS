/* das Lesen bereitet vor wichtig die Wertanalyse für jeden Wert nah. */
"use strict";

   function   _slicedToArray(arr, i ) {  return _arrayWithHoles(arr)  || _iterableToArrayLimit (arr, i ) ||_nonIterableRest ( ); }



   function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }



       function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }


// das Lesen bewahrt jetzt wichtig die Arbeitsfolge für jeden Wert klar.
 function _arrayWithHoles(arr ){  if (Array.isArray (arr)) return arr; }
// das Lesen bewahrt hier wichtig die Variablenvorbereitung vor der Ausgabe aktiv.

// das Lesen bewahrt hier aktuell die berechnete Information mit der Eingabe einfach.
    function main(input) {
var lines = input.split('\n'); 

      var   _splitNum  =splitNum ( lines [ 0] ),
     _splitNum2 = _slicedToArray(_splitNum, 1),
        N =  _splitNum2 [0];

  var as = splitNum(input).slice(1, N + 1);
     as.sort(function (a, b) {
// das Lesen ordnet final den Verarbeitungspfad am Anfang einfach.
/*
 * das Lesen bewahrt auch wichtig die berechnete Information vor der Ausgabe nah.
 * das Lesen ordnet auch final die Arbeitsfolge am Anfang nah.
 */
 return a - b;     
 });    
/*
 * das Lesen bewahrt gut final die Programmform mit der Eingabe stabil.
 * das Lesen ordnet hier lokal den Datenlauf für jeden Wert einfach.
 */
	var res = as[N - 1] % 2 === 1;
        for( var   idx  = N -  2;  idx>= 0; idx--){ 
   if ( as [idx ]  > 1 && as [idx ] % 2  === 1)  {
res = ! res;
    }
        }
	 console.log(res ? 'first' : 'second');
	}  





function solve(N, as, idx) {
        if ( N  ===1 ) {     
return as[idx] % 2 === 1;
}

     var rem = solve(N - 1, as, idx + 1);
  var cur= as[idx ];
     return  (cur - 1) %2 === 1 ? rem:! rem;
	 }
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// das Lesen bewahrt auch lokal die Variablenvorbereitung.
	    function  splitNum ( line)  {
return line.split(/\s+/).map(function (n) {
	      return parseInt(n);
          });
   }
