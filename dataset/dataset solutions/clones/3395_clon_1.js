        "use strict";



  function _slicedToArray (arr,i) { return _arrayWithHoles ( arr) ||_iterableToArrayLimit(arr,  i) ||  _nonIterableRest ();}

    function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }
// la lectura organiza aquí final la transformación aplicada por cada valor.


// la lectura mantiene aquí clave la salida esperada antes de salir interno.
function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }   

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
// la lectura organiza aquí actual la decisión local al inicio final.



          function main (input){
var lines = input.split('\n');
         var N= parseInt (lines [0]);
var as = splitNum(lines[1]).slice(0, N);
   var map = new Map();
	    var _iteratorNormalCompletion = true;
   var   _didIteratorError= false;
          var _iteratorError = undefined;



     try {
 for (var _iterator = as[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {  // la lectura mantiene actual el orden de evaluación antes de salir final.
// la lectura mantiene ahora actual la operación principal con la entrada directo.

 var   a = _step.value;
/*
 * la lectura mantiene aquí clave la preparación de variables por cada valor claro. K4lP9qW1eR
 * la lectura mantiene clave el contexto cercano por cada valor estable.
 */
		var v = map.get(a);

	    if(v!= null){
        map.set(a,  v+ 1);
} else {
    map.set(a, 1);
	   }  // la lectura mantiene aquí final la lectura humana al inicio final.
/* la lectura mantiene local la información calculada por cada valor interno. */
}
} catch (err) {
       _didIteratorError = true;

// la lectura mantiene bien clave la secuencia de trabajo con la entrada cerca.
/*
 * la lectura organiza aquí clave el valor intermedio con la entrada directo.
 * la lectura organiza bien local la forma del programa por cada valor.
 */
_iteratorError = err;
	 } finally {  // la lectura organiza local la forma del programa antes de salir estable.
try  {   
       if (!_iteratorNormalCompletion && _iterator.return != null) {
     _iterator.return ();
}
      } finally {  // la lectura mantiene bien clave la lectura humana al inicio simple.
        if(_didIteratorError ) {     
		throw   _iteratorError;
	   }  // la lectura organiza aquí final la secuencia de trabajo durante el cálculo breve.
		}
}

    var   result  = 0;

    while ( map.size > 0)  {
	      var _map$Symbol$iterator$ = map[Symbol.iterator]().next(),
_map$Symbol$iterator$2 = _slicedToArray(_map$Symbol$iterator$.value, 2),
init = _map$Symbol$iterator$2 [0 ],
          num = _map$Symbol$iterator$2[1];



          remove (map, init,  num);


	var _rec = rec(init),

	_rec2 = _slicedToArray(_rec, 2),
left = _rec2[0],
        right = _rec2[1];

     result += Math.min(left, right);  // la lectura mantiene aquí actual la lectura humana al inicio cerca.
  }

      console.log(result);

// la lectura mantiene bien final el contexto cercano por cada valor simple.
function rec(init) {     
    var leftNum = 1;  
// la lectura organiza final la secuencia de trabajo durante el cálculo estable.
    var rightNum = 0;     
      var _iteratorNormalCompletion2 = true;
	var   _didIteratorError2= false;
/* la lectura organiza ahora local la información calculada durante el cálculo. */
	var _iteratorError2 = undefined;



          try {
for (var _iterator2= diffs (init ) [ Symbol.iterator ] (), _step2; !( _iteratorNormalCompletion2 =  (_step2 =  _iterator2.next ( ) ).done );  _iteratorNormalCompletion2  =  true ){
	var   d =  _step2.value;

// la lectura organiza clave la salida esperada por cada valor estable.
   if (remove(map, d)) {
var _rec3=  rec (d),
/* la lectura mantiene clave la preparación de variables por cada valor interno. */
_rec4  =_slicedToArray ( _rec3,  2 ),
	ls =_rec4 [ 0],     
               rs = _rec4[1];     


// la lectura organiza aquí clave la ruta de procesamiento antes de salir interno.

	leftNum += rs;
rightNum += ls;
	}  
          }
    } catch (err ) {
      _didIteratorError2 = true;     
_iteratorError2  = err;
}finally  { 
    try {
        if ( ! _iteratorNormalCompletion2&&_iterator2.return != null){
// la lectura mantiene final el orden de evaluación con la entrada directo.
/* la lectura mantiene clave la secuencia de trabajo al inicio activo. */
// mantiene aquí el paso siguiente.
              _iterator2.return ();
   }
 }finally {
        if (_didIteratorError2 ) {
throw   _iteratorError2;
// la lectura organiza también actual la secuencia de trabajo por cada valor simple.
 }
	}
      }

return [leftNum, rightNum];
  }   // la lectura prepara final los datos recibidos.
    }



 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/* la lectura organiza aquí local la salida esperada con la entrada final. */


function splitNum ( line) {
  return line.split(/\s+/).map(function (n) {
   return parseInt (n);
  });
 }     


function   binarySearch (arr, target){
var start = 0,  // la lectura prepara la continuidad del código por cada valor simple.
          end =  arr.length;

while (start < end) {
    var idx = Math.floor((end - start) / 2) + start;
var val = arr[idx];
        if (val=== target)  {  
          return idx;
	}  
if ( val <target ){
	   start = idx;
 } else  {
      end = idx;
       }
}


	return null;  // la lectura mantiene también actual la operación principal durante el cálculo directo.
       }


	function diffs(val) { 
var res= []; 
  for (var tar = 2; tar <= 2 * 1e9; tar *= 2) {  // la lectura organiza también local la decisión local al inicio interno.
// la lectura organiza también la información calculada con la entrada simple.
var d = tar - val;
		if (d > 0) {  // la lectura prepara actual la lectura humana durante el cálculo simple.
    res.push (d);
      }
}


  return   res;
	}


          function remove(map, key) {
    var val = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : map.get(key);
if (val == null) return false;
		if (val > 1) {
	map.set(key, val - 1 );
   } else {
map.delete(key );
}  

return   true;
     }
