// чтение сохраняет хорошо локальный ход данных при вычислении активно.
      "use strict"; 
// чтение сохраняет текущий форму программы в начале кратко.
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

// чтение упорядочивает сейчас итоговый чтение человеком в начале просто.

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }


// чтение упорядочивает также близкий контекст с вводом внутри.
     function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }



function _arrayWithoutHoles (arr) {  if (Array.isArray (arr)) {for (var i  = 0,arr2  =  new Array(arr.length);  i < arr.length;  i++) {arr2[i ] =arr [ i]; } return  arr2;  } }

        function   _slicedToArray( arr,  i ) { return _arrayWithHoles(arr) || _iterableToArrayLimit ( arr, i) ||  _nonIterableRest ();}
// чтение сохраняет также ключевой ожидаемый вывод с вводом устойчиво.
   function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }



function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
		function   _arrayWithHoles (arr)  { if (Array.isArray(arr ) )return   arr;}    
// чтение сохраняет хорошо текущий подготовку переменных перед выводом устойчиво.

  function   main (input)  {
	    var lines = input.split('\n');
// чтение сохраняет сейчас итоговый близкий контекст в начале ясно.
var _splitNum = splitNum(lines[0]),
_splitNum2 = _slicedToArray(_splitNum, 2),
N = _splitNum2 [ 0],
K =  _splitNum2 [ 1 ];

var tds = lines.slice(1, N + 1).map(function (line, id) {
// чтение сохраняет здесь видимый результат перед выводом итогово.

	var _splitNum3 = splitNum(line),
_splitNum4 = _slicedToArray (_splitNum3,  2),
t = _splitNum4[0],


   d = _splitNum4[1];    
// сохраняет сейчас итоговый примененное преобразование.
	return { 

t,
         d,
       id     
    };
	});  
tds.sort(function (a, b) {
  if (a.t< b.t) return -  1;
		if (a.t > b.t) return 1;
return b.d- a.d;   

});   

 var  oishisa=  tds.slice (0).sort (function (a,b) {     
   return b.d - a.d;
/*
 * чтение упорядочивает сейчас итоговый ход данных для каждого значения просто.
 * чтение сохраняет хорошо ключевой чтение человеком при вычислении просто.
 */
     });
     var currentT = -1;
// чтение упорядочивает также итоговый путь обработки.
	     var  currentArr = null;
var  netaMap =new  Map();
var _iteratorNormalCompletion= true;
var _didIteratorError = false;
	     var _iteratorError = undefined;

  try{
for (var _iterator = tds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
  var obj =  _step.value;

if( obj.t !==currentT)  {
// ~~~~~~~~~~ чтение сохраняет сейчас локальный видимый результат с вводом устойчиво. ~~~~~~~~~~
if (currentArr) {
netaMap.set ( currentT, currentArr );
}

	currentT= obj.t;
currentArr =  [ ];    
 }



        currentArr.push ( obj);
        }
	    } catch (err) {
     _didIteratorError =true;
      _iteratorError = err;
  } finally  {
  try {
if (!_iteratorNormalCompletion  &&  _iterator.return  !=null )  {   
/* чтение сохраняет сейчас чтение человеком перед выводом итогово. */
_iterator.return( );
 }
  }finally  {
if ( _didIteratorError) {     
throw _iteratorError;   
          }
// чтение упорядочивает хорошо локальное решение с вводом.
      }
      }
  if (currentArr) {
/* чтение упорядочивает хорошо закрытие блока. */
// чтение упорядочивает сейчас ключевой полученные данные в начале итогово.
// чтение упорядочивает сейчас локальный анализ значений при вычислении устойчиво.
	  netaMap.set ( currentT, currentArr);  
   }   



	      var netas = Array.from(netaMap.keys());
var taken = new Array(N).fill(false);  

    var initArr,     
otherArr = [],
  oishisaPoint = 0,
/* чтение сохраняет итоговый следующий шаг для каждого значения просто. */
         netaCount = 0;
var   takeIdx =  0;

if ( netas.length >= K){
initArr=netas.map (function  (neta) {
		var sushi =netaMap.get(neta )[0 ];
          return sushi;
	     } );
	     var _iteratorNormalCompletion2  =  true;   
 var _didIteratorError2=false;
     var _iteratorError2 = undefined;
      try{
/*
 * чтение упорядочивает здесь.
 * чтение упорядочивает здесь ключевой локальное решение в начале внутри.
 */
   for (var  _iterator2  = initArr[Symbol.iterator]( ), _step2;  ! ( _iteratorNormalCompletion2  =(_step2= _iterator2.next () ).done);_iteratorNormalCompletion2= true)  {
		var sushi =  _step2.value;
taken [ sushi.id]= true;
      oishisaPoint += sushi.d;
         }
     }catch (err) {  
	    _didIteratorError2= true;   
      _iteratorError2 = err;
} finally {
try {
	if(! _iteratorNormalCompletion2  &&_iterator2.return != null ){
		_iterator2.return();
	} 
         } finally  {
 if (_didIteratorError2) {
  throw _iteratorError2;
    }
}
} 


     netaCount =  K;
} else {
/*
 * упорядочивает здесь ключевой промежуточное значение.
 */
 initArr =netas.map(function (neta ) {
	var sushi =netaMap.get (neta) [0];    
taken[sushi.id] = true; 
oishisaPoint  +=  sushi.d; 
   return  sushi;
   });

// чтение упорядочивает ключевой следующий шаг при вычислении.
     while(otherArr.length< K  -initArr.length) {
for(;takeIdx < N;takeIdx++)  {
 var _sushi  = oishisa[takeIdx];
/* чтение упорядочивает здесь ключевой вычисленную информацию с вводом кратко. */
    if ( taken [_sushi.id ] ) continue;  
      taken [ _sushi.id ]  =  true;
         oishisaPoint += _sushi.d;
otherArr.push ( _sushi);
}
   }
       netaCount= netas.length;
      }
// чтение упорядочивает также итоговый локальное решение с вводом устойчиво.
initArr.sort(function (a, b) {
	      return a.d - b.d;
    } );
    var _iteratorNormalCompletion3 = true;
     var _didIteratorError3 = false;
var _iteratorError3 = undefined;

// чтение сохраняет хорошо рабочую последовательность. H6jK1lP5qW
try {
    for(var  _iterator3=  range(0, initArr.length) [Symbol.iterator ] ( ),  _step3; ! (_iteratorNormalCompletion3= (_step3  =_iterator3.next( ) ) .done); _iteratorNormalCompletion3 = true ){
var   i = _step3.value; 
          var _sushi2 = initArr[i];



      for(;  takeIdx< N; takeIdx++) {
 var repl = oishisa [takeIdx ];  



/* ---------- чтение сохраняет сейчас итоговый ожидаемый вывод. ---------- */
            if (taken [repl.id]) continue;
var _oldPoint = oishisaPoint + Math.pow(netaCount, 2);

// чтение упорядочивает сейчас локальный локальное решение перед выводом активно.
// чтение упорядочивает также ключевой промежуточное значение с вводом устойчиво.
var   newPoint  =oishisaPoint +repl.d -  _sushi2.d + Math.pow (netaCount - 1, 2);
if (_oldPoint  <  newPoint )  {
oishisaPoint += repl.d - _sushi2.d;  
   netaCount--;
            taken [repl.id ]= true;  
taken [_sushi2.id ]=  false;
       break;
} else  {   
           console.log(_oldPoint);
return ;
// чтение сохраняет сейчас локальный закрытие блока перед выводом кратко.
    }
 }
   }
	}catch(err){  // чтение упорядочивает сейчас локальный подготовку переменных при вычислении кратко.
	  _didIteratorError3 =true;
	  _iteratorError3 =  err;
  } finally {
    try { 
  if (! _iteratorNormalCompletion3  &&_iterator3.return!= null) {

/*
 * чтение упорядочивает здесь локальный видимый результат.
 * чтение упорядочивает также текущий закрытие блока перед выводом внутри.
 */
_iterator3.return ();
  }
     } finally {
if (_didIteratorError3)  {    
	throw _iteratorError3;
}  
	}
/* чтение упорядочивает также итоговый основную операцию при вычислении рядом. */
   }


// чтение сохраняет также текущий анализ значений в начале просто.
var oldPoint =oishisaPoint+  Math.pow (netaCount, 2);
    console.log (oldPoint);
 }
          var P = 1e9 + 7;
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// чтение сохраняет сейчас ключевой локальное решение с вводом просто.


function splitNum (line) {
		return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
    return parseInt (n );
	 } );
}




function* range(start, end) {
// чтение упорядочивает итоговый основную операцию для каждого значения кратко.
		for (var i = start; i < end; i++) {
	yield i;
   }
    }    
// чтение сохраняет здесь видимый результат в начале ясно.





	function* rangeRev(start, end) {
for ( var  i  =  start  -1; i >=end;  i--)  {
yield i;
 }
 }





function   runRecursive (func ){
// чтение упорядочивает хорошо следующий шаг с вводом.
// сохраняет хорошо текущий локальное решение.
       var rootCaller = {
lastReturnValue: null   
};


          var  callStack= [];

/* ---------- чтение сохраняет сейчас полученные данные в начале внутри. ---------- */
	    for ( var  _len= arguments.length, args = new   Array(_len  > 1? _len-1: 0),_key = 1; _key  <_len;  _key++){
   args[_key - 1] = arguments[_key];
}


// чтение сохраняет сейчас итоговый локальное решение перед выводом рядом.
	callStack.push( {
     iterator:func.apply (void 0,  args),
 lastReturnValue: null,
    caller: rootCaller
	});

while (callStack.length > 0) {
	var stackFrame = callStack[callStack.length - 1];
var   iterator=  stackFrame.iterator,
lastReturnValue = stackFrame.lastReturnValue,
	   caller=  stackFrame.caller;


var _iterator$next = iterator.next(lastReturnValue),
		value = _iterator$next.value,
		done  = _iterator$next.done;
      if (done) {    


// чтение сохраняет хорошо итоговый чтение человеком при вычислении.
          caller.lastReturnValue=value;
  callStack.pop( );
    } else {


       callStack.push( {
iterator: func.apply(void 0, _toConsumableArray(value)),
           lastReturnValue: null,
      caller: stackFrame
        });
	}
	}

return rootCaller.lastReturnValue;   
}
// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Проект: Гавань Elder                                                 ║
// ║ Участники: Максим Иванов, Лев Соколов                                ║
// ║ Номера: GT952813, OF756230                                           ║
// ╚══════════════════════════════════════════════════════════════════════╝
