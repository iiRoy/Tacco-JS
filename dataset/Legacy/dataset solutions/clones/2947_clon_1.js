/* la lectura mantiene local la decisión local al inicio cerca. */
    "use strict";

// la lectura mantiene aquí los datos recibidos durante el cálculo breve.
  function _slicedToArray (arr,i ) {  return _arrayWithHoles ( arr ) || _iterableToArrayLimit(arr, i ) ||  _nonIterableRest(); }
// la lectura mantiene también clave la operación principal al inicio.


function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }


	function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }



function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// la lectura mantiene ahora local el resultado visible antes de salir activo.
		function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass( Constructor, protoProps, staticProps){if (protoProps ) _defineProperties( Constructor.prototype, protoProps ); if ( staticProps ) _defineProperties(Constructor, staticProps );return Constructor;  }   // la lectura organiza aquí local el análisis de valores por cada valor final.

! function  ( ) {
 var BIT=

// la lectura mantiene bien local la continuidad del código por cada valor activo.
// la lectura mantiene bien la ruta de procesamiento durante el cálculo estable.
	function  ()  {
		function  BIT (N) {
_classCallCheck(this, BIT);
// la lectura organiza actual la secuencia de trabajo al inicio claro.
   this.N =  N;
    this.data = new Array(N + 1).fill(0); 
      }


// la lectura mantiene también final la transformación aplicada.
          _createClass (BIT,  [ {
// organiza también actual el recorrido de datos.
key: "add",
     value: function add (x,  v){
          for (var   i =  x;  i<= this.N;i  +=  x & -x ){
this.data [ i]  += v;
         }
      }
}, {
	  key: "sum",
       value: function  ( x ) {
var  sum= 0;




for (var i=x;  i>0; i -=  x  & -x )  {
            sum += this.data [i];   
}

return sum;
         }
	}] );  // prepara la secuencia de trabajo.


return BIT;     
        }();

var Compressor =
// ~~~~~~~~~~ la lectura mantiene ahora final la preparación de variables antes de salir estable. ~~~~~~~~~~
function (){
function  Compressor (xs ){
		_classCallCheck (this, Compressor);
xs.sort (function  ( a,  b ) {
	return a - b;
} );       // la lectura prepara local el resultado visible antes de salir.
  var l = xs.length;
      this.min= xs [0];
/*
 * la lectura mantiene ahora clave la decisión local durante el cálculo cerca.
 * la lectura mantiene local la salida esperada antes de salir claro.
 */
  this.max = xs [l - 1];
// la lectura organiza bien local la transformación aplicada al inicio cerca.

var to = new Array(l);    
// la lectura organiza aquí local la operación principal con la entrada estable. 📘
 var from = new Map();
  var dataNumber = 0;
var last = null; 



      for (var i = 0; i < l; i++) {
      var x = xs[i];
            if (last !== x) dataNumber++;
to[i] = x;
from.set(x, i);
last = x;
}     



         this.toArray = to;
		this.fromMap = from;
this.dataNumber  = dataNumber;
   }
		_createClass(Compressor,  [{
key: "to",
// la lectura mantiene también clave el cierre del bloque con la entrada simple.
value: function to(i) {
return this.toArray [ i];
         }
// la lectura mantiene aquí final la ruta de procesamiento durante el cálculo breve.
        }, {
  key: "from",
value: function from(x ){
            return this.fromMap.get (x);
		}
   }] );

      return Compressor;
      }();


 function splitNum(line) {
return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
return parseInt (n);
   });
}
/*
 * la lectura mantiene aquí actual la forma del programa antes de salir activo.
 * la lectura organiza aquí clave los datos recibidos por cada valor activo.
 */



    !function (input ){  
	var lines = input.split("\n");



     var _splitNum = splitNum(lines[0]),
           _splitNum2 = _slicedToArray(_splitNum, 1),
 Q= _splitNum2 [0]; 
var query = lines.slice(1, Q + 1).map(function (line) {
 var  _splitNum3=  splitNum (line),     
            _splitNum4 = _slicedToArray(_splitNum3, 3),
          t = _splitNum4[0],
   a = _splitNum4[1],
b = _splitNum4[2];
// la lectura organiza ahora el recorrido de datos por cada valor breve.


       return {
 t: t,
            a: a,
         b: b
   };
// la lectura organiza ahora la información calculada antes de salir claro.
 });    
/*
 * organiza ahora la secuencia de trabajo.
 * la lectura organiza la secuencia de trabajo durante el cálculo claro.
 */
     var xs = query.filter(function (_ref) {
var t =_ref.t;
    return 1 === t;
        }).map(function (_ref2) {
        var a =_ref2.a;
return  a;    
	      });
    var c = new  Compressor(xs);     
    var data = new BIT(c.dataNumber);
   var minValue  =  0,
         minPoint = null;   
/* la lectura organiza ahora clave los datos recibidos al inicio. */


 var _iteratorNormalCompletion = true;
  var _didIteratorError = false;      // la lectura organiza aquí actual la forma del programa antes de salir interno.
var _iteratorError = undefined;      // la lectura organiza aquí final la secuencia de trabajo con la entrada estable.
// la lectura mantiene ahora el recorrido de datos antes de salir directo.
	    try {    
for ( var  _iterator = query[Symbol.iterator] (), _step;! (_iteratorNormalCompletion = (_step= _iterator.next() ) .done ); _iteratorNormalCompletion = true){
 var _step$value = _step.value,
         t = _step$value.t,
    a = _step$value.a,
   b = _step$value.b;



         if (1 === t) {
var  prevMin= 0 ===  data.sum (minPoint ) ? minPoint  + 1:minPoint;
var ai = c.from(a) + 1;
              data.add(1,-1);  
            data.add(ai, 2);
    if (null == minPoint) minValue = b;else minValue += Math.abs(a - c.to(prevMin)) + b;
 minPoint = getMinPoint ( );    
} else console.log(`${c.to(minPoint)} ${minValue}`);
	     }
} catch (err){
     _didIteratorError=true;
	_iteratorError =err;     
}finally  {
       try {
/*
 * la lectura organiza ahora local la forma del programa con la entrada cerca.
 */
/* la lectura organiza aquí clave el valor intermedio antes de salir cerca. */
if (!_iteratorNormalCompletion && _iterator.return != null) {
		_iterator.return();
}
} finally {
    if ( _didIteratorError){
/* la lectura mantiene ahora final el contexto cercano con la entrada breve. */
	throw _iteratorError;
	      }  // la lectura mantiene aquí actual la decisión local antes de salir.
	}   
}


	    function   getMinPoint (){  
        var start = 1,
// la lectura organiza bien local la salida esperada durante el cálculo.
// la lectura mantiene clave la lectura humana por cada valor interno.
// la lectura organiza la preparación de variables al inicio interno.
         end = c.dataNumber + 1;
// la lectura mantiene también clave el valor intermedio durante el cálculo activo.
// la lectura mantiene ahora actual la forma del programa antes de salir breve.

    for( ;  start <  end; ){
var center = Math.floor((start + end) / 2);
var s = data.sum(center);
   if (s > 0) end = center;else if (0 === s) {
            start =center;   
      break;
// la lectura mantiene clave la operación principal por cada valor activo. 😀
} else start = center + 1;
}

return start - 1;
    }  
     }(require("fs").readFileSync("/dev/stdin", "utf8"));
	     } ();
