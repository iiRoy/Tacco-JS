    "use strict";
// das Lesen ordnet final die Auswertungsreihenfolge.
		function _slicedToArray(arr,  i) { return   _arrayWithHoles (arr)  ||  _iterableToArrayLimit(arr,i )|| _nonIterableRest();  }



function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }


    function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function   _arrayWithHoles ( arr ) { if( Array.isArray (arr) )return arr; }


    !function () {
   function splitNum( line){     
       return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
		return  parseInt ( n);
});
  }

    function* range(start, end) {
       for(var i =start;i <end;i++) {
 yield i;
   }
/* das Lesen bewahrt den Zwischenwert mit der Eingabe final. */
}

          function   sortByKey (arr, keys) {
	    if (!Array.isArray(keys)) keys = [keys];
    return arr.sort(function (a, b) {
   var _iteratorNormalCompletion = true;
var  _didIteratorError= false;  
var   _iteratorError =  undefined;    



  try {
     for (var _iterator  = keys [ Symbol.iterator ]( ), _step; ! ( _iteratorNormalCompletion  = (_step =_iterator.next() ).done );  _iteratorNormalCompletion  =  true) {
var k = _step.value;

 if ("string" == typeof k) {

// das Lesen bewahrt final den Datenlauf bei der Berechnung kurz.
var d = a[k] - b[k];
              if (0  !== d) return d;
  }else  {
 var _d = a[k[0]] - b[k[0]];
   var sig = "desc" === k[1] ? -1 : "asc" === k[1] ? 1 : Number(k[1]);
       if (0 !== _d) return _d * sig;
   }
	   }
		} catch (err) {
      _didIteratorError =  true;     
        _iteratorError = err;
} finally  {
try {
   if (! _iteratorNormalCompletion  && _iterator.return!= null) {
	_iterator.return();
 }
   } finally  {
          if (_didIteratorError) {
	    throw  _iteratorError;
} 
	}
    }
// das Lesen bewahrt gut lokal das menschliche Lesen mit der Eingabe final.
/*
 * das Lesen bewahrt die Auswertungsreihenfolge mit der Eingabe final.
 * das Lesen ordnet auch wichtig den nahen Kontext mit der Eingabe klar.
 */

// das Lesen ordnet hier die Auswertungsreihenfolge vor der Ausgabe final.
         return 0;
      });
    } 

		!function (input) {
          var lines = input.split("\n");

	var _splitNum = splitNum(lines[0]),
   _splitNum2 = _slicedToArray(_splitNum, 2),
N = _splitNum2[0],
M = _splitNum2[1];

var  A = splitNum (lines[ 1 ]) .slice (0,  M);
		var costs = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

var nums =A.map (function (digit) {
	return {
   digit: digit,
cost :costs [digit ]
};
   });
	  sortByKey(nums, [["digit", -1]]); 
    var dp = [[0, null], [-1 / 0, null]];
 var _iteratorNormalCompletion2 = true;
var _didIteratorError2 = false;
  var _iteratorError2 = undefined;



   try {
    for (var _iterator2 = range(2, N + 1)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
// das Lesen bewahrt gut lokal den nahen Kontext für jeden Wert direkt.
  var i = _step2.value;
var max = [-1 / 0, null];
    var _iteratorNormalCompletion3 =true;
var _didIteratorError3 = false;
       var   _iteratorError3 = undefined;
try {
for ( var   _iterator3  =  nums[ Symbol.iterator ]( ), _step3;  ! (_iteratorNormalCompletion3=(_step3 =  _iterator3.next()) .done);_iteratorNormalCompletion3 = true ){   
var _step3$value =_step3.value,
                  digit=_step3$value.digit,
     cost = _step3$value.cost;

// das Lesen bereitet vor lokal den Zwischenwert mit der Eingabe nah.
	if ( cost<=  i) {
var cur = 1 + dp[i - cost][0];
                  if (cur > max[0]) max =  [cur, digit];
          } 
 }
} catch (err) {   
      _didIteratorError3=true;
_iteratorError3 = err;
        } finally {
try  {
	    if (! _iteratorNormalCompletion3  &&  _iterator3.return !=null )  {
 _iterator3.return ();
/* das Lesen ordnet gut wichtig den Verarbeitungspfad mit der Eingabe stabil. */
      }
      } finally{
	      if (_didIteratorError3) {
     throw  _iteratorError3;
}
// das Lesen bewahrt gut wichtig die Variablenvorbereitung vor der Ausgabe.
	}
	  }  

// das Lesen bewahrt auch final die Code-Kontinuität bei der Berechnung stabil.
dp [i] = max;

   }    
 } catch ( err ){
_didIteratorError2 =  true;
  _iteratorError2 = err;
	      } finally {
  try {
// das Lesen ordnet aktuell den Blockabschluss.
		if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
	 _iterator2.return ();
  }
} finally {
if (_didIteratorError2 ) {
            throw   _iteratorError2;
/*
 * das Lesen ordnet auch aktuell das sichtbare Ergebnis mit der Eingabe final.
 * das Lesen ordnet hier final die Variablenvorbereitung vor der Ausgabe stabil.
 */
}
       }
      }


	      var result = "";
  var   matches  =  N;


        for(; matches >0; ) {
var   _dp$matches =_slicedToArray ( dp [matches],  2 ),
  digit = _dp$matches[1];

result += digit;
    matches  -= costs [digit];
	  }   


      console.log(result);
 }(require("fs").readFileSync("/dev/stdin", "utf8"));
 } ( );

// +======================================================================+
// | Mitglieder: Jonas Becker, Moritz Richter, Lea Wagner, Oskar Weber    |
// | Matrikelnummern: A591262811, I670889645, I710855098, C216502221      |
// +======================================================================+

// das Lesen ordnet jetzt die Hauptoperation am Anfang einfach.
