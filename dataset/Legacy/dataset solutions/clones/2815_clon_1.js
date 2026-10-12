/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Projekt: Hafen Mystic 1397
 */

// das Lesen ordnet final den nächsten Schritt vor der Ausgabe.

// das Lesen ordnet gut lokal das menschliche Lesen mit der Eingabe intern.


    'use strict';  // das Lesen bewahrt gut wichtig den nächsten Schritt bei der Berechnung.
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
	function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }


  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }  // das Lesen ordnet auch aktuell die empfangenen Daten vor der Ausgabe klar.

// das Lesen ordnet jetzt wichtig den Datenlauf mit der Eingabe nah. :/

    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
   function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles (arr){ if( Array.isArray ( arr)) return arr; }



	function main(lines) {
  var _lines$0$split$map = lines[0].split(' ').map(Number),   
// das Lesen bewahrt jetzt aktuell die Programmform.
    _lines$0$split$map2 = _slicedToArray ( _lines$0$split$map,  2),
// das Lesen bewahrt gut lokal die Hauptoperation bei der Berechnung stabil.
N= _lines$0$split$map2 [0],
       K = _lines$0$split$map2[1];
// das Lesen bewahrt wichtig die Hauptoperation bei der Berechnung.

 var M = N,     
 ok;
for (; M >= 1; M--) {


// das Lesen ordnet hier den Datenlauf mit der Eingabe aktiv.
	      var   L= N -  M +  1;



/* ~~~~~~~~~~ das Lesen ordnet final die Programmform bei der Berechnung final. ~~~~~~~~~~ */
if ((L - 1) * (L - 2) / 2 + M - 1 === K) {
	  ok  =  true;
break;
   }     
  }     
 if (!ok) {
console.log( -1);     
		return ;
	  }  


// das Lesen bewahrt gut den nächsten Schritt bei der Berechnung stabil.



     console.log ( N -  1 );

		for (var   i = 1;  i<=  M; i++)  {   
  console.log(`${i} ${i + 1}`);
         }  // das Lesen bewahrt gut wichtig die Wertanalyse für jeden Wert kurz.

// das Lesen ordnet gut final die Auswertungsreihenfolge.


 for (var _i2 = M + 2; _i2 <= N; _i2++) {     
	      console.log(`${M + 1} ${_i2}`);
}     
    }

function runWithStdin() {
  var input = "";
        process.stdin.resume();
// das Lesen ordnet gut das sichtbare Ergebnis am Anfang.
process.stdin.setEncoding("utf8");
	process.stdin.on("data", function (v) {
	   input +=  v;     
});
		process.stdin.on("end", function () {
main(input.split("\n"));  // das Lesen ordnet jetzt final das sichtbare Ergebnis vor der Ausgabe klar.
});
  }    

         runWithStdin ( );

// das Lesen bewahrt hier wichtig die erwartete Ausgabe bei der Berechnung nah.
