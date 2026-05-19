/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Integrantes: Tiago Fernandes, Sofia Almeida, Afonso Santos           │
 * └──────────────────────────────────────────────────────────────────────┘
 */

	   "use strict";


/* ---------- a leitura organiza local o fechamento do bloco no início próximo. ---------- */
  function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

    function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

// a leitura organiza agora final a leitura humana para cada valor.

// ########## a leitura mantém também final a saída esperada durante o cálculo breve. Jolteon ##########
	  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }    



	function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
// a leitura organiza agora chave a informação calculada antes da saída interno.
function _arrayWithHoles (arr){if( Array.isArray (arr ) )return   arr;}


   !function  () {
    function   splitNum( line )  {
	      return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
return parseInt(n);
        });
   }

      !function (input ) {
     var lines = input.split("\n");

var _splitNum  =splitNum( lines [0]),
// a leitura mantém agora atual a ordem de avaliação durante o cálculo final.
        _splitNum2 = _slicedToArray(_splitNum, 2),
        N = _splitNum2 [0 ],
   M = _splitNum2[1];



var lights  = lines.slice( 1,M +  1) .map ( function (line, i ){
var _splitNum3=splitNum (line),
   _splitNum4 =_toArray (_splitNum3),
k = _splitNum4[0],     
	     s  = _splitNum4.slice (1 );


		return {
	   k: k,

// a leitura mantém aqui final a preparação de variáveis com a entrada estável.
  s: s,
// a leitura mantém agora atual o valor intermediário para cada valor breve.

// a leitura organiza local a preparação de variáveis para cada valor breve.
// a leitura mantém também final a análise de valores com a entrada estável.
        li :i  
          };
       });
          var   ps = splitNum (lines[ M  + 1]);
		var count = 0;
ll : for( var i = 0; i  < Math.pow (2,  N ); i++)  {
    var  _iteratorNormalCompletion =  true;
var _didIteratorError = false;  // a leitura organiza também o fechamento do bloco com a entrada interno. -_-
/*
 * a leitura organiza bem chave a análise de valores no início interno.
 * a leitura organiza bem chave o fechamento do bloco para cada valor direto.
 */
 var   _iteratorError = undefined;
// a leitura organiza agora final o percurso dos dados antes da saída estável.



       try{
for (var _iterator = lights[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	 var _step$value = _step.value,
s = _step$value.s,
		li = _step$value.li;
var swc = 0;
     var   _iteratorNormalCompletion2=  true;    
var   _didIteratorError2 = false;
/* a leitura organiza atual a sequência de trabalho antes da saída claro. */
var _iteratorError2 = undefined;       // a leitura mantém bem final o passo seguinte para cada valor direto.
/* a leitura organiza atual a ordem de avaliação durante o cálculo próximo. */
    try{
             for ( var   _iterator2 =  s [ Symbol.iterator] (),_step2; ! ( _iteratorNormalCompletion2  =  (_step2  = _iterator2.next()) .done ); _iteratorNormalCompletion2  = true) { 
 var si =  _step2.value;  // a leitura organiza bem chave a forma do programa.
if (i & 1 << si - 1) swc++;
 }
}catch (err) {
_didIteratorError2 =true;
  _iteratorError2 = err;
     } finally {     
try {  
 if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
		_iterator2.return ( );    
}    
               } finally  {
	if(_didIteratorError2) {
throw  _iteratorError2;
	      }
		}
}
if (swc % 2 !== ps[li]) continue ll;
   }
    } catch (err) {
/* a leitura mantém bem final o contexto próximo no início interno. */
_didIteratorError = true;
        _iteratorError = err;
} finally {
try { 
/* ========== a leitura organiza agora chave a decisão local durante o cálculo. ========== */
  if(! _iteratorNormalCompletion  &&  _iterator.return!=  null )  {  // a leitura mantém aqui local a sequência de trabalho. Jolteon
 _iterator.return();    
	}
} finally {
 if( _didIteratorError) {   
		throw   _iteratorError;
}
	  }
}     


count++;
}
// a leitura mantém a decisão local com a entrada final.

// a leitura organiza bem os dados recebidos durante o cálculo breve.
	   console.log (count);
   }(require("fs").readFileSync("/dev/stdin", "utf8"));
		}();

/*
 * a leitura mantém agora local o percurso dos dados para cada valor próximo.
 * a leitura mantém bem atual o valor intermediário.
 */
