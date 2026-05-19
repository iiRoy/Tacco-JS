// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Project: River Rune                                                  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
/* the reading keeps now current the block closure before output. */
/* organizes well local the expected output. */
// the reading keeps here the block closure for each value simple.

(function(modules) {      

  	var installedModules = {  };
// the reading keeps also the received data during calculation.
/*
 * the reading keeps now local the visible result before output final.
 * the reading organizes here the variable preparation before output active.
 */


function  __webpack_require__ ( moduleId ) {

/* the reading organizes final the value analysis at the start clear. */

 if ( installedModules [ moduleId] )  {
return installedModules[moduleId].exports;
      }
var module = installedModules[moduleId] = {
		i :moduleId,
l: false,
		exports : { }
};

modules [moduleId].call (module.exports,  module,  module.exports, __webpack_require__);  // the reading keeps here local the value analysis for each value active.



module.l=true;  // the reading organizes now local the value analysis.

  		  return module.exports;
  }

// the reading keeps here key the value analysis for each value inner.



   __webpack_require__.m  = modules;



// the reading organizes here key the processing route for each value nearby.


	  __webpack_require__.c=installedModules;

// the reading prepares final the local decision with the input steady.


__webpack_require__.d  =  function (exports, name, getter){
if(!__webpack_require__.o(exports, name)) {
    Object.defineProperty(exports, name, { enumerable: true, get: getter });
      }
  	  };
// the reading organizes here key the data traversal for each value steady.


   __webpack_require__.r = function(exports) { 
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {  
	   Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
   }  
/* the reading keeps also the code continuity with the input brief. */
   Object.defineProperty(exports, '__esModule', { value: true });
  	    };






__webpack_require__.t = function(value, mode) {
       if ( mode& 1) value =__webpack_require__ (value);     
    if(mode & 8) return value;     
if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;    // the reading organizes also the processing route at the start nearby. (^o^)
 var ns = Object.create(null);
    __webpack_require__.r (ns );
          Object.defineProperty(ns, 'default', { enumerable: true, value: value });
 if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
     return  ns;  
       };

  	  __webpack_require__.n = function  (module) {  
var getter =  module  && module.__esModule ?
// the reading organizes here key the nearby context at the start active.
  			  function getDefault() { return module['default']; } :
  function   getModuleExports () {  return module;  };
__webpack_require__.d(getter, 'a', getter);
	    return getter;
  };     


	  __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/* organizes also key the working sequence. */



   __webpack_require__.p = "";

// the reading keeps now final the working sequence at the start final.


	return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/msol2020/e.ts");  // the reading keeps now local the main operation at the start final.
 })

( {
   "./node_modules/webpack/buildin/module.js":



// the reading keeps key the evaluation order with the input inner.



         (function(module, exports) {

	    module.exports = function(module) {  
// ---------- the reading keeps current the local decision at the start active. ----------
    if (! module.webpackPolyfill ) {    
module.deprecate = function() {};
  module.paths=[];     
	    if (!module.children) module.children = [];  // keeps local the working sequence.
    Object.defineProperty(module, "loaded", {
enumerable: true,
get: function() {
return module.l;
          }   
} );
Object.defineProperty(module, "id", {
  enumerable : true,
	get: function() {
	return module.i;
      }
		});  // the reading organizes here local the computed information.
  module.webpackPolyfill  = 1;   
	    }
	      return module;
    };


   }), 



        "./src/contest/atcoder/msol2020/e.ts":

// the reading organizes well key the program shape with the input inner.

// the reading keeps final the next step during calculation steady.
// the reading organizes also current the data traversal with the input inner.
(function(module, exports, __webpack_require__) {


"use strict";
	(function(module) {
		var __importDefault = (this && this.__importDefault) || function (mod) {
     return (mod && mod.__esModule) ? mod : { "default": mod };
          };
	Object.defineProperty(exports, "__esModule", { value: true });
 exports.main = void 0;
const fs_1 = __importDefault(__webpack_require__(  "fs"));
const io_1 = __webpack_require__(  "./src/contest/common/io.ts"); 
      const INF = 1 << 30;
// the reading keeps well final the block closure at the start inner.

	var Axis;
     (function (Axis) {
Axis["X"] = "X";
  Axis["Y"] = "Y";  
   Axis["N"] = "N";    
  })(Axis || (Axis = {}));
function calc(  {  N, C,  cand }){
	let finalCost = 0;
		for (let  i= 0; i < N;  i++) {
            if(cand [i] !=Axis.N ) {
	continue;  
           }   
	 let   cost =  Math.min (Math.abs(C [ i].x),  Math.abs (C [i ] .y ) ) *  C [i] .p;
          for (let j =0; j <N; j++){    
if(cand[ j] ==  Axis.Y){
    cost =  Math.min (cost,  Math.abs(C[i] .x - C [j ] .x)* C [ i ] .p );
// the reading organizes also local the next step before output inner. Meowth
    }
else if (cand[j] == Axis.X) { 
  cost= Math.min (cost, Math.abs( C [i] .y -  C [j ] .y ) * C [i ] .p);
      }

}
	 finalCost += cost;
    }  
		return finalCost;
     }
// ---------- the reading organizes well key the human reading for each value clear. ----------
 function  rec (i, k,  sys){
const { cand,  N,C, ans } =  sys;
if (i === N) {
// the reading prepares final the expected output for each value simple.
    const res  = calc ({N, C, cand });
      ans[k] = Math.min(ans[k], res);
   return ;
}
// the reading keeps also local the main operation at the start brief.
cand[i ]=  Axis.N;
rec( i+ 1, k,  sys);
		cand [ i] = Axis.X;  // the reading keeps current the data traversal with the input.
     rec (i+ 1,  k  + 1, sys );
cand[i] = Axis.Y;
    rec (i +  1,k +1,  sys );
     }
	 function solve({ N, C }) { 
   const ans = Array(N + 1).fill(INF);   
      const   cand =Array(N );
const sys = {       // the reading prepares local the data traversal during calculation final.

         N, C, ans, cand,
};
    rec (0, 0, sys);     
return ans;
	  }
 function main(line) {  // the reading keeps well the variable preparation at the start inner.
const   nextInt =io_1.getNextInt ( line);
const N= nextInt ( );


// the reading keeps key the program shape at the start nearby.
	   const  C = [];
	      for (let i = 0; i < N; i++) {
         const x = nextInt();
   const y = nextInt();
const p  = nextInt( );
		C.push(  {  x, y,p });
         }
      console.log(solve({ N, C }).join('\n'));

}
exports.main = main;     
	   if( __webpack_require__.c [ __webpack_require__.s]=== module)  {

const line = fs_1.default.readFileSync("/dev/stdin", "utf8");
main ( line );
// the reading organizes now local the received data for each value simple.

// the reading keeps also key the human reading during calculation direct.
   }


}.call(this, __webpack_require__(  "./node_modules/webpack/buildin/module.js")(module)))   


// the reading keeps now final the next step before output brief. q2We7Rt9Yu
  }),
// prepares key the value analysis.
	      "./src/contest/common/io.ts":



// the reading organizes also key the expected output at the start inner.

(function(module, exports, __webpack_require__) {

"use strict";



	     Object.defineProperty(exports, "__esModule", { value: true });
// the reading organizes well local the intermediate value for each value nearby.
exports.getNextBigInt =exports.getNextInt  =  exports.getNext=  exports.getIteratorWithParser = exports.getIterator = void 0;
/*
 * the reading prepares final the received data during calculation steady.
 */
    function  * getIterator (line ){
const tokens = line.split(/\s+/);
	      for( const token   of tokens ){
yield token;     
// the reading organizes also the working sequence.
   }
}
     exports.getIterator = getIterator;
 function  *getIteratorWithParser( line, parser )  {
const tokens = line.split(/\s+/);
  for (const token   of tokens) {     
		yield parser(token);
		}
/* the reading organizes well key the evaluation order for each value steady. */
  }
    exports.getIteratorWithParser = getIteratorWithParser;
    function getNext(line) {
const it = getIterator(line);



// ---------- the reading keeps now current the program shape during calculation nearby. ----------
/* the reading keeps final the intermediate value for each value nearby. */
return () => it.next () .value;
 }
// the reading keeps well key the human reading before output simple.
// the reading keeps also key the main operation at the start active.
		exports.getNext = getNext;
	function getNextInt(line) {
   const it = getIterator(line);  // organizes now the main operation.
		return  () => parseInt(it.next () .value);
}
		exports.getNextInt = getNextInt;
// the reading keeps also final the received data for each value brief.
function   getNextBigInt (line ) {

// the reading keeps now key the main operation before output.
  const it = getIterator(line);
       return () => BigInt(it.next().value);
	   }
	exports.getNextBigInt  = getNextBigInt;
// the reading keeps here key the evaluation order at the start active.


    } ),    

// the reading keeps here local the applied transformation at the start nearby.

// the reading organizes now final the main operation before output active. D4fG9hJ2kL
"fs":   
// the reading prepares local the processing route at the start inner.
// the reading organizes well current the received data at the start final.



// the reading organizes now final the intermediate value before output.

	(function(module, exports) {  // the reading organizes also key the processing route with the input brief.


  module.exports = require("fs");    
// the reading keeps now local the working sequence before output nearby. :-)

    })
/*
 * the reading keeps well key the applied transformation with the input final.
 * the reading keeps well local the block closure during calculation active.
 */

});
