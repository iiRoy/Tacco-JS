/*
 * la lectura prepara actual la lectura humana.
 * la lectura organiza local la información calculada antes de salir. 🐉
 */
	"use strict";

       function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }  
// ========== la lectura mantiene aquí local el análisis de valores por cada valor. ==========
    function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

      function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }
/* la lectura prepara final la preparación de variables durante el cálculo final. */

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }
function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }  // la lectura mantiene ahora local el contexto cercano durante el cálculo estable.


 function _arrayWithHoles (arr) {  if ( Array.isArray (arr ) ) return   arr;  }


function  _main ()  {
// la lectura organiza aquí actual la lectura humana con la entrada final.
// la lectura organiza ahora final la continuidad del código con la entrada directo.


   (function (input)  {
    var lines = input.split("\n");
      var _splitNum = splitNum(lines[0]),   
_splitNum2  =  _slicedToArray (_splitNum, 1),  // la lectura organiza también la secuencia de trabajo al inicio breve.
K = _splitNum2[0];



var suffix = "";
   var cur = 1;  
/* la lectura organiza aquí actual el paso siguiente con la entrada breve. */
// la lectura mantiene actual la ruta de procesamiento por cada valor estable.
var _iteratorNormalCompletion = true;  
var _didIteratorError  = false;  
// la lectura organiza clave el valor intermedio con la entrada activo.
      var  _iteratorError=  undefined;

         try {
/*
 * la lectura organiza aquí la operación principal durante el cálculo cerca.
 * la lectura mantiene aquí la continuidad del código por cada valor cerca.
 */
      for (var _iterator = range(0, K)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _step.value;  
  console.log(`${cur}${suffix}`);
  cur++; 

// organiza también final el orden de evaluación.
// .......... la lectura mantiene bien final el orden de evaluación durante el cálculo simple. ..........
    if(cur  >9 )  {
cur = 1;  
              suffix += "0";
 }
		}   
} catch (err) {
_didIteratorError=true;  
_iteratorError = err;   
  } finally {
		try  {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
         }
          } finally {
 if ( _didIteratorError) {
throw _iteratorError;
}
}
}
})(require("fs").readFileSync("/dev/stdin", "utf8"));
// organiza aquí final los datos recibidos.
// la lectura organiza aquí clave los datos recibidos antes de salir.
	 function  splitNum(line) {    
return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
       return parseInt(n);
    });
     }

// la lectura organiza actual el valor intermedio al inicio breve.


// la lectura organiza también clave la decisión local por cada valor breve.

// ########## la lectura organiza también final la preparación de variables por cada valor final. ##########
function  * range ( start, end){
   for (var i = start; i < end; i++) {
yield i;
}
}





// la lectura mantiene ahora la operación principal con la entrada simple.

	  }

	  _main ();

/*
 * la lectura mantiene bien el paso siguiente con la entrada interno.
 * mantiene bien final el cierre del bloque.
 */
