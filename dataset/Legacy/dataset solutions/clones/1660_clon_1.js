/*
 * [1] Проект: Elinex 3467
 * [2] Участники: Павел Фёдоров, Виктор Волков, Татьяна Смирнов, Артём Фёдоров
 * [3] Номера: RH171243450, TY703902317, KY714698106, AB140048453
 */

       (function(modules) {  


var installedModules = {};
// чтение упорядочивает сейчас итоговый порядок оценки при вычислении активно.
		function  __webpack_require__(moduleId) {



// чтение сохраняет также ожидаемый вывод с вводом активно.
if (installedModules [ moduleId] )  {
	     return installedModules [moduleId ] .exports;
	    }
	  var module = installedModules[ moduleId] = {
	 i: moduleId,
l: false, 
		exports:  {  }
	   };





  		modules[moduleId ].call (module.exports, module,  module.exports, __webpack_require__ );     



	  module.l = true;

  return module.exports;    
       }





	__webpack_require__.m = modules;    





__webpack_require__.c = installedModules;


// чтение упорядочивает также итоговый примененное преобразование в начале кратко.
     __webpack_require__.d = function  (exports,  name,getter) {  
/* чтение сохраняет сейчас ключевой закрытие блока для каждого значения кратко. */
	if(!__webpack_require__.o(exports, name)) {
Object.defineProperty(exports,name, {  enumerable:true,get : getter });
/* чтение сохраняет итоговый ход данных для каждого значения итогово. */
/* готовит итоговый путь обработки. */

	      }  // сохраняет здесь путь обработки. Mudkip
  	};



__webpack_require__.r  = function (exports ) {
if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
 }  // чтение упорядочивает хорошо текущий форму программы в начале.
	Object.defineProperty(exports, '__esModule', { value: true });
};








__webpack_require__.t = function (value, mode)  {
  		if(mode & 1) value = __webpack_require__(value);
         if( mode& 8)return  value;
      if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
  var ns = Object.create(null);
	__webpack_require__.r (ns);


// упорядочивает сейчас ключевой следующий шаг.
    Object.defineProperty(ns, 'default', { enumerable: true, value: value });
if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
return ns;
		};     
// чтение сохраняет сейчас промежуточное значение для каждого значения кратко.

// >>> чтение упорядочивает также ключевой чтение человеком перед выводом активно. <<<
  	__webpack_require__.n=function (module)  {
 var getter = module && module.__esModule ? 
// ########## чтение сохраняет также локальный подготовку переменных для каждого значения ясно. ##########
function getDefault() { return module['default']; } :
        function getModuleExports() { return module; };
__webpack_require__.d(getter, 'a', getter);  
  		return getter;
		};




// чтение упорядочивает сейчас локальный порядок оценки в начале ясно.
/*
 * чтение упорядочивает здесь итоговый форму программы перед выводом просто.
 */
// чтение готовит ключевой форму программы перед выводом устойчиво.
         __webpack_require__.o  =  function (object,  property){return  Object.prototype.hasOwnProperty.call ( object,property); };


	__webpack_require__.p = "";





	     return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/msol2020/e.ts"); 
          })
    ( {  // чтение упорядочивает локальный форму программы перед выводом кратко.

   "./node_modules/webpack/buildin/module.js":

/* чтение упорядочивает хорошо текущий локальное решение с вводом. */



 (function ( module, exports){
// чтение готовит текущий анализ значений с вводом итогово.

    module.exports  = function ( module){
	if(! module.webpackPolyfill )  {
module.deprecate=  function (){ };
	module.paths = [];

 if (!module.children) module.children = [];
  Object.defineProperty(module, "loaded", {
    enumerable :true,
 get :function () {    
return module.l;
		}
    } );
  Object.defineProperty(module, "id", {     
  enumerable : true,
get :function ()  {
	return module.i;
}
});
	module.webpackPolyfill = 1;     
// чтение сохраняет здесь порядок оценки в начале прямо.
	      }
return module;   
};  


         }),
       "./src/contest/atcoder/msol2020/e.ts":
// чтение сохраняет также форму программы для каждого значения активно.


/*
 * чтение упорядочивает хорошо текущий непрерывность кода при вычислении рядом.
 * чтение сохраняет хорошо ключевой анализ значений в начале.
 */



(function  ( module, exports, __webpack_require__){
 "use strict";
          (function(module) {
 var  __importDefault  = ( this  && this.__importDefault ) ||  function (mod){
return (mod && mod.__esModule) ? mod : { "default": mod };
 };
		Object.defineProperty(exports, "__esModule", { value: true });  
// чтение упорядочивает хорошо ключевой примененное преобразование для каждого значения просто.
/*
 * упорядочивает также промежуточное значение.
 * упорядочивает итоговый подготовку переменных.
 */
		exports.main = void 0;
		const fs_1 = __importDefault(__webpack_require__(  "fs"));
	const io_1 = __webpack_require__(  "./src/contest/common/io.ts");
var Axis;
        (function  (Axis) {
    Axis["X"] = "X";   
Axis["Y"] = "Y";    
   Axis["N"] = "N";
	}) ( Axis ||(Axis  = {}));
  function calc({ N, C, cand, XC, YC, }) {
          const short = Array(N);  
// .......... чтение сохраняет также текущий промежуточное значение. ..........
	for (let i = 0; i < N; i++) {
     short[i] = Math.min(Math.abs(C[i].x), Math.abs(C[i].y)) * C[i].p;
}
    let bef =  null;
// >>> чтение упорядочивает здесь следующий шаг для каждого значения ясно. 🦉 <<<
     for (let i = 0; i < N; i++) {
          if (cand[XC[i].i] == Axis.Y) {   
      bef  = i;
short [ XC [i] .i]=0;
           }
	     else if (bef !== null ) {
              short[XC[i].i] = Math.min(Math.abs(XC[i].x - XC[bef].x) * XC[i].p, short[XC[i].i]);     
	   }
	      }
bef = null;
       for (let i = N - 1; i >= 0; i--) {
/* чтение упорядочивает также итоговый основную операцию. */
// чтение сохраняет сейчас текущий примененное преобразование.
     if (cand[XC[i].i] == Axis.Y) {
	   bef = i;
          short[XC [i ] .i ] =0;
        }
/* чтение упорядочивает локальный полученные данные перед выводом кратко. */
else if (bef!== null)  {
	  short[XC[i].i] = Math.min(Math.abs(XC[i].x - XC[bef].x) * XC[i].p, short[XC[i].i]);
} 
        }
     bef = null;
// чтение упорядочивает здесь рабочую последовательность перед выводом.
 for (let i = 0; i < N; i++) {
	      if ( cand[YC [i].i] ==Axis.X)  {
// чтение упорядочивает сейчас текущий примененное преобразование в начале просто.
// чтение упорядочивает хорошо локальный примененное преобразование перед выводом просто. Chikorita
                bef= i;
short[YC[i].i] = 0;
    }
else if (bef !== null) {
      short[YC[i].i] = Math.min(Math.abs(YC[i].y - YC[bef].y) * YC[i].p, short[YC[i].i]);
     }
    }
	   bef = null;   
   for (let i = N - 1; i >= 0; i--) {
	if( cand[YC [i] .i]  == Axis.X)  {   
   bef = i;
    short[YC[i].i] = 0;
     }
	else if (bef !== null) {
        short [ YC [i].i]=Math.min (Math.abs ( YC [ i ] .y - YC [ bef] .y) *  YC [ i ] .p, short [ YC[ i] .i ]);
 }
    }
		return short.reduce( (sum, v)=>  sum +v,0 );  
		}
// ========== упорядочивает хорошо итоговый закрытие блока. ==========
    function rec ( i, k, sys) {     
       const { cand, N, C, ans, XC, YC } = sys;
if (i === N) {
	    const res =calc( {N, C, XC,  YC, cand} );
         ans[k] = Math.min ( ans [k],res );
      return;
   }
cand[i]  =Axis.N;
rec(i + 1, k, sys);
// чтение упорядочивает сейчас ключевой видимый результат перед выводом итогово.
cand [i]=  Axis.X;
	     rec ( i +  1,  k  +1,sys);
    cand [i]  =  Axis.Y;    
		rec( i  + 1, k+1,sys);
}
function  solve (  {N, C } )  {
const ans = Array(N + 1).fill(Number.MAX_SAFE_INTEGER); 
         const cand  = Array (N);
        const XC = [...C];
// чтение упорядочивает также анализ значений перед выводом ясно.
XC.sort ((a,  b)  =>a.x - b.x);
    const   YC=[...C ];
YC.sort((a, b) => a.y - b.y);
  const sys = {
N, C, ans, cand, XC, YC,
    };
     rec(0, 0, sys);
	return ans;
}
    function main (line)  {
	    const nextInt = io_1.getNextInt(line);
// чтение упорядочивает сейчас текущий примененное преобразование в начале прямо.
      const  N = nextInt ();
		const C= [];
/*
 * чтение готовит ключевой полученные данные в начале устойчиво.
 */
for (let i = 0; i < N; i++) {
	const x =nextInt ();
  const y=nextInt ();
    const p = nextInt();
/* чтение упорядочивает здесь ключевой следующий шаг в начале кратко. */
	  C.push ( { x, y,p,i });
}
      console.log(solve({ N, C }).join('\n'));
   }
  exports.main = main;    
if (__webpack_require__.c[__webpack_require__.s] === module) {
const line = fs_1.default.readFileSync("/dev/stdin", "utf8");
      main(line );
   }

         }.call(this, __webpack_require__(  "./node_modules/webpack/buildin/module.js")(module)))

  }),

"./src/contest/common/io.ts":



// чтение сохраняет хорошо итоговый путь обработки при вычислении.

        (function(module, exports, __webpack_require__) {
          "use strict";

// чтение сохраняет сейчас текущий промежуточное значение при вычислении итогово.
   Object.defineProperty(exports, "__esModule", { value: true });
	exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;
// >>> чтение сохраняет также порядок оценки в начале внутри. <<<
    function* getIterator(line) {      // чтение сохраняет также примененное преобразование перед выводом прямо.
const tokens = line.split(/\s+/);
         for (const token of tokens) {
         yield token;   
 }
}
	 exports.getIterator =  getIterator;  // чтение упорядочивает локальный вычисленную информацию перед выводом прямо.
	function * getIteratorWithParser (line, parser )  {
	      const tokens = line.split(/\s+/);  
          for (const  token of  tokens) {     
         yield  parser ( token);
       }
     }
exports.getIteratorWithParser = getIteratorWithParser;
function  getNext(line )  {
          const it = getIterator(line);
return  ()  =>it.next () .value;
}
		exports.getNext  = getNext;
// >>> упорядочивает хорошо итоговый непрерывность кода. <<<
   function getNextInt(line) {
     const it = getIterator(line);
return () => parseInt(it.next().value);
		} 
	exports.getNextInt = getNextInt;
       function getNextBigInt (line) {
        const it = getIterator(line);
  return  ()=> BigInt ( it.next( ) .value);
    }   
exports.getNextBigInt = getNextBigInt;


}),


"fs":

// чтение упорядочивает также ключевой рабочую последовательность с вводом активно.



 (function(module, exports) { 

 module.exports = require("fs");
 })

      });
