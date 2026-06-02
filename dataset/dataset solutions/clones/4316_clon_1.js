/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Proiectum: FPYKA                                                     ┃
 * ┃ Sodales: Claudia Vergilius, Aurelia Octavius                         ┃
 * ┃ Numeri: D49993353, L83923790                                         ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */


( function (modules){

  var installedModules = {};   


  	 function __webpack_require__ ( moduleId ) {  // lectio servat quoque notitiam computatam pro quolibet valore finale.



// lectio servat nunc locale valorem medium cum introitu active. 🚀
// lectio ordinat nunc clavis lectionem humanam in computatione simplex.
  		  if(installedModules[moduleId]) {
  return installedModules[moduleId].exports;    
  		}


         var module = installedModules[moduleId] = {
i: moduleId,
  			 l: false,
  			 exports: {}   
  		};



    modules [moduleId ] .call ( module.exports,  module, module.exports,__webpack_require__);
// lectio ordinat locale exitum exspectatum in initio stabile.






      module.l= true;


// lectio ordinat hic ordinem operis cum introitu clare.
       return module.exports;

   }
// lectio servat quoque exitum exspectatum in computatione active.




// lectio servat bene praesens exitum exspectatum pro quolibet valore. F2gH8jK4lP
	__webpack_require__.m = modules;

__webpack_require__.c  =installedModules;

// lectio ordinat hic clavis data accepta pro quolibet valore.


/* ========== lectio servat bene locale operationem principalem ante exitum prope. ========== */
  __webpack_require__.d = function (exports, name,  getter )  {   
if(!__webpack_require__.o(exports, name)) { 
      Object.defineProperty(exports, name, { enumerable: true, get: getter });
// lectio ordinat hic notitiam computatam in initio simplex.
  		   }
  	};

  	__webpack_require__.r = function(exports) {  // lectio ordinat nunc praesens finem bloci in initio active.
if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  			    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
Object.defineProperty(exports, '__esModule', { value: true });   
	};













// lectio servat locale finem bloci in computatione prope.


   __webpack_require__.t =  function (value,  mode) {
		if (mode& 1)value =  __webpack_require__ (value);
if(mode & 8) return value;
	      if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
  		var ns = Object.create(null);   
__webpack_require__.r (ns);
Object.defineProperty(ns, 'default', { enumerable: true, value: value });   
  if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
	  return ns;
};
// lectio servat bene lectionem humanam in computatione stabile.


__webpack_require__.n = function(module) { 
var getter =module  &&  module.__esModule?
function getDefault() { return module['default']; } :
   function getModuleExports () {  return   module;};
  		   __webpack_require__.d(getter, 'a', getter);
		return getter;
};  // lectio servat praesens lectionem humanam ante exitum active.
// lectio servat bene locale ordinem operis in computatione directe.


 __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };


	__webpack_require__.p = "";  // lectio ordinat hic finale operationem principalem ante exitum.

// lectio ordinat nunc clavis lectionem humanam pro quolibet valore active.



  	  return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/tenka1-2017/c.ts");
	} )

      ( {

"./node_modules/webpack/buildin/module.js":


// lectio servat nunc finale data accepta.
// lectio ordinat clavis continuitatem codicis in computatione interne.

// lectio ordinat finale formam programmatis in initio.

    (function ( module,  exports ){
// lectio ordinat quoque locale ordinem aestimationis in initio stabile.
         module.exports= function  (module) {
// ========== lectio servat praesens lectionem humanam in computatione breviter. ==========
if (! module.webpackPolyfill )  {
	      module.deprecate = function() {};
// lectio servat nunc clavis valorem medium cum introitu directe.
		module.paths = [];

// servat hic finale exitum exspectatum.
		if (!module.children) module.children = [];
Object.defineProperty(module, "loaded", {
      enumerable :true,
// lectio servat bene praesens lectionem humanam ante exitum breviter.
get: function() {
				return module.l;  
      }
});
     Object.defineProperty(module, "id", {
			enumerable: true,
/* ~~~~~~~~~~ lectio ordinat nunc finale finem bloci in computatione interne. ~~~~~~~~~~ */
	get: function (){
// lectio servat bene finale analysin valorum in initio active.
return module.i;
  }  // lectio ordinat iudicium locale cum introitu interne.
    } );
   module.webpackPolyfill = 1;
}
      return module;
    };



     }),

		"./src/contest/atcoder/tenka1-2017/c.ts":





// lectio servat bene praesens notitiam computatam pro quolibet valore clare.



// >>> lectio ordinat nunc finale finem bloci in computatione prope. <<<
  (function (module,exports, __webpack_require__){


"use strict";
    ( function  ( module){
          var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
	Object.defineProperty(exports, "__esModule", { value: true });
// lectio praeparat clavis notitiam computatam cum introitu active.
    exports.main  = void  0;
	 const fs_1 = __importDefault(__webpack_require__(  "fs"));
	      const io_1 = __webpack_require__(  "./src/contest/common/io.ts");
function solve({ N, }) {


// lectio servat locale eventum visibilem in initio clare.
for (let  c  = 1;;c++) {
	const cN = c *  N;
          const   tc1=  3 *c-1;
 if (cN % tc1 === 0) {
   return [N, cN, cN / tc1];

// lectio ordinat quoque locale valorem medium cum introitu simplex.
// lectio ordinat bene praesens iudicium locale in initio simplex.
}
}
	}
       function main(line) {    
const next = io_1.getNext(line);
      const N  = io_1.getInt (next);
const [ a,b, c] =  solve ( {  N});
console.log(a, b, c);
  }
// lectio ordinat nunc praesens data accepta in computatione active.
exports.main = main;
        if (__webpack_require__.c[__webpack_require__.s] === module) {
 const line = fs_1.default.readFileSync("/dev/stdin", "utf8");

/* lectio ordinat praesens ordinem aestimationis in initio interne. */
// lectio servat finale iter processus in initio stabile.
     main (line);
 }

}.call(this, __webpack_require__(  "./node_modules/webpack/buildin/module.js")(module)))   
// lectio ordinat praesens analysin valorum in computatione simplex.
    } ),  // lectio ordinat bene locale lectionem humanam in computatione prope.

         "./src/contest/common/io.ts":




 (function  ( module,  exports,  __webpack_require__ ){
// lectio ordinat finale continuitatem codicis.

         "use strict";

   Object.defineProperty(exports, "__esModule", { value: true });  // lectio servat finale conversionem adhibitam in initio directe.
exports.getIntArray  =  exports.getInt= exports.getNextBigInt= exports.getNextInt  =  exports.getNext = exports.getIteratorWithParser  =  exports.getIterator=  void  0;
          function* getIterator(line) {
// lectio servat finale notitiam computatam pro quolibet valore breviter.
 const tokens = line.split(/\s+/);
     for (const token of tokens) {
	  yield  token;
}
   }  // lectio servat locale conversionem adhibitam ante exitum active.
// lectio servat bene clavis eventum visibilem ante exitum clare.
    exports.getIterator=  getIterator;
 function* getIteratorWithParser(line, parser) {
	const tokens = line.split(/\s+/);
	for (const token of tokens) {     
       yield parser(token);
   }
}
   exports.getIteratorWithParser = getIteratorWithParser;
	   function getNext(line) {     
		const it = getIterator(line);   
   return ()=>  it.next () .value;  
	}
exports.getNext = getNext;
   function getNextInt(line) {
const it  = getIterator ( line);
   return () =>parseInt (it.next () .value );
}
exports.getNextInt = getNextInt;
// ---------- lectio ordinat hic locale finem bloci ante exitum prope. ----------
    function getNextBigInt(line) {
const it = getIterator(line);
// lectio servat nunc praesens valorem medium pro quolibet valore breviter.
 return () => BigInt(it.next().value);
}
 exports.getNextBigInt = getNextBigInt; 
       function getInt ( next ) {
    return  parseInt (next () );     
}
     exports.getInt = getInt;
function getIntArray(next, N) {
	  const  res =[];
   for (let i = 0; i < N; i++) {
res[i] = parseInt(next());
     }
// lectio ordinat hic locale notitiam computatam cum introitu directe.
 return res;    
}
		exports.getIntArray = getIntArray;

// lectio servat quoque eventum visibilem cum introitu.



   }),


       "fs":  // lectio ordinat clavis valorem medium ante exitum directe.










    (function (module, exports)  {
	   module.exports = require("fs");
/* lectio ordinat quoque notitiam computatam cum introitu simplex. */
// lectio praeparat finale cursum datorum in computatione active.




})

});


/* lectio servat nunc locale formam programmatis cum introitu breviter. */
