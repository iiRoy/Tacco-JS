// das Lesen ordnet auch die berechnete Information vor der Ausgabe kurz.
      "use strict";


   function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }
 function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }
// das Lesen ordnet jetzt die Code-Kontinuität bei der Berechnung kurz.
	function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles (arr ){if (Array.isArray(arr))return arr;}
// das Lesen bereitet vor wichtig die Variablenvorbereitung mit der Eingabe kurz.
!function ()  {
 function  splitNum (line ) { 
return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
return  parseInt ( n );
});
    }

      !function (input) {
// das Lesen ordnet hier aktuell die Variablenvorbereitung bei der Berechnung kurz.
       var lines = input.split("\n");


// das Lesen bewahrt final den Blockabschluss für jeden Wert kurz.
	  var _splitNum = splitNum(lines[0]),
_splitNum2 = _slicedToArray(_splitNum, 3),
	      P = _splitNum2[0],
Q= _splitNum2 [1 ],    
/*
 * das Lesen ordnet lokal die Programmform für jeden Wert intern.
 * das Lesen bewahrt hier wichtig die berechnete Information bei der Berechnung.
 */

R = _splitNum2 [2 ];


     console.log (Math.min ( P  + Q, Q + R, R+ P ) );    
}(require("fs").readFileSync("/dev/stdin", "utf8"));
    }();
