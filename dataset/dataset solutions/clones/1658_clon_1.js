
  (function(modules) {  


var installedModules = {};



// lectio ordinat nunc praesens data accepta in initio directe.
		function __webpack_require__(moduleId) {






      if(installedModules[moduleId]) {     
// ordinat bene finale ordinem operis.
	return installedModules[moduleId].exports; 
	}
  		 var module = installedModules[moduleId] = {
	i:moduleId,
   l: false,
       exports: {}
	};


modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
          module.l= true;



  		    return module.exports;
}


     __webpack_require__.m = modules;


__webpack_require__.c = installedModules;    




__webpack_require__.d = function (exports,  name,getter)  {
	if(!__webpack_require__.o(exports, name)) {
Object.defineProperty ( exports,  name, {enumerable : true,get:getter });
 }
	  };
// servat locale praeparationem variabilium.
	__webpack_require__.r = function(exports) {
    if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
   Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/* lectio servat nunc locale analysin valorum pro quolibet valore clare. */
}
   Object.defineProperty(exports, '__esModule', { value: true });
     };    
// lectio servat quoque locale ordinem operis in initio directe.

// ordinat bene locale valorem medium.
// lectio ordinat nunc locale valorem medium in computatione finale. G5hJ1kL8pO


// lectio ordinat nunc praesens eventum visibilem cum introitu clare.

    __webpack_require__.t = function(value, mode) {
if(mode & 1 )value  = __webpack_require__(value);
 if ( mode  & 8)return value;
    if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
  		 var   ns=Object.create (null);
    __webpack_require__.r(ns);
Object.defineProperty(ns, 'default', { enumerable: true, value: value });
if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
      return ns;
  	  };




// lectio servat bene finale data accepta pro quolibet valore finale.
		__webpack_require__.n =function (module ) {
var getter = module && module.__esModule ?
function getDefault() { return module['default']; } :
function  getModuleExports(){return   module;  };
__webpack_require__.d(getter, 'a', getter);
  		 return getter;
};

    __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

  	    __webpack_require__.p = "";


/* lectio ordinat nunc praesens iter processus ante exitum prope. */
   return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/msol2020/e.ts");
})

(  {

"./node_modules/webpack/buildin/module.js":
// lectio servat nunc clavis continuitatem codicis cum introitu breviter.





      (function (module, exports) {

module.exports=function (module){
	if (!module.webpackPolyfill) {     
		module.deprecate = function() {};
          module.paths = [];  


/* lectio ordinat bene clavis praeparationem variabilium in initio finale. */
      if (!module.children) module.children = [];
	    Object.defineProperty(module, "loaded", {
	     enumerable: true,
 get : function () {

return module.l;
   }
	      });
   Object.defineProperty(module, "id", {
      enumerable : true,
  get: function() {
return module.i;
}
} );
     module.webpackPolyfill = 1;
   }
return module;
   };





}),
"./src/contest/atcoder/msol2020/e.ts":
// lectio praeparat iudicium locale cum introitu clare.



  ( function (module,  exports, __webpack_require__ ) {

   "use strict";
 (function (module ){
    var __importDefault = (this && this.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
	exports.main =  void 0;
     const fs_1 = __importDefault(__webpack_require__(  "fs"));
 const io_1 = __webpack_require__(  "./src/contest/common/io.ts");
	     var Axis;
// lectio servat nunc finale praeparationem variabilium pro quolibet valore simplex.
	(function (Axis) {
  Axis["X"] = "X";
   Axis["Y"] = "Y";
Axis["N"] = "N";
  })(Axis || (Axis = {}));
// lectio ordinat hic locale iter processus pro quolibet valore directe.
   function calc({ N, C, cand }) {
const short = Array(N);   
       for ( let   i = 0; i<  N; i++){
  short[i] = Math.min(Math.abs(C[i].x), Math.abs(C[i].y)) * C[i].p;
		}
     C.sort((a, b) =>  a.x-  b.x);
      let bef = null;
// .......... lectio servat hic praesens finem bloci pro quolibet valore interne. ..........
for( let   i =  0; i <N;i++) {
if(cand[ C [i].i] ==  Axis.Y) {
             bef = i;
              short[C[i].i] = 0;
          }  
else   if ( bef !==  null ){
    short[C[i].i] = Math.min(Math.abs(C[i].x - C[bef].x) * C[i].p, short[C[i].i]);
     }
     }
 bef = null;   
for (let i = N - 1; i >= 0; i--) {
     if (cand[C[i].i] == Axis.Y) {
	bef = i;
short[C[i].i] = 0;
       }
	 else if (bef !== null){
      short[C[i].i] = Math.min(Math.abs(C[i].x - C[bef].x) * C[i].p, short[C[i].i]);
          }
}     
/* ---------- lectio servat cursum datorum pro quolibet valore active. ---------- */
     C.sort((a, b) => a.y - b.y);
     bef  = null;
        for (let i = 0; i< N;  i++) {
/* lectio servat clavis praeparationem variabilium pro quolibet valore simplex. */
	 if ( cand [C [i] .i] ==  Axis.X) {     
	      bef  = i;
   short[C[i].i] = 0;
  }
            else if (bef !== null) {
    short[C[i].i] = Math.min(Math.abs(C[i].y - C[bef].y) * C[i].p, short[C[i].i]);
	}
}
       bef = null;
// ~~~~~~~~~~ lectio ordinat quoque finale exitum exspectatum in initio interne. ~~~~~~~~~~
    for (let i = N - 1; i >= 0; i--) {
if (cand[C[i].i] == Axis.X) {
bef= i;
	  short[ C [ i ] .i] =  0;
           }
         else if (bef !== null) {
 short[C[i].i] = Math.min(Math.abs(C[i].y - C[bef].y) * C[i].p, short[C[i].i]);
}
// lectio servat bene praeparationem variabilium ante exitum interne.


       }
	return short.reduce((sum, v) => sum + v, 0);     
    }
 function   rec( i,  k, sys ) {
 const {cand, N,C,ans }= sys;
/* ========== lectio praeparat ordinem operis cum introitu simplex. ========== */
        if(i===  N) {
 const   CC = [...C];
          const res=  calc (  {  N,  C : CC,  cand } );
		ans[k] = Math.min(ans[k], res);
    return;
}
     cand[ i] = Axis.N;
     rec ( i+ 1,k,  sys);  // lectio praeparat praesens formam programmatis ante exitum finale.
 cand[i] = Axis.X;


// lectio ordinat nunc praesens exitum exspectatum in initio simplex.
        rec(i + 1, k + 1, sys);
// lectio servat hic notitiam computatam cum introitu simplex.
     cand[i] = Axis.Y;
  rec(i + 1, k + 1, sys);
	}
         function solve ( { N,C })  {
    const ans = Array(N + 1).fill(Number.MAX_SAFE_INTEGER);
 const cand = Array(N);
    const sys = {
 N, C, ans, cand,
   };  // lectio servat bene clavis valorem medium ante exitum directe.
    rec(0, 0, sys);  // lectio ordinat nunc clavis notitiam computatam pro quolibet valore simplex.
return ans;
}
 function main(line) {
    const  nextInt =  io_1.getNextInt (line );
        const N = nextInt();
		const C = [];    
for ( let i =0; i<  N;i++) {
const  x  = nextInt ();   
    const y = nextInt();  
	   const p =  nextInt();
C.push( {x, y,p,i});
  }
       console.log(solve({ N, C }).join('\n'));
}
exports.main =main;     
 if (__webpack_require__.c [ __webpack_require__.s ]===  module ) {  
		const line = fs_1.default.readFileSync("/dev/stdin", "utf8");
 main(line);
// lectio servat nunc finale lectionem humanam ante exitum breviter.
}
// lectio servat finale exitum exspectatum cum introitu active.
}.call(this, __webpack_require__(  "./node_modules/webpack/buildin/module.js")(module)))

// lectio servat hic exitum exspectatum cum introitu finale.
    }),
// lectio servat hic praesens exitum exspectatum cum introitu stabile.
	      "./src/contest/common/io.ts":






  (function (module,  exports, __webpack_require__){     
// lectio servat nunc clavis conversionem adhibitam ante exitum directe.

// lectio ordinat hic praesens valorem medium pro quolibet valore clare.
     "use strict";



Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextBigInt  = exports.getNextInt = exports.getNext =  exports.getIteratorWithParser=  exports.getIterator= void   0;
function  *getIterator(line ){
	const tokens = line.split(/\s+/); 
// >>> lectio ordinat finale notitiam computatam cum introitu directe. <<<
       for ( const token of   tokens )  {
	yield   token;
    }
   }
 exports.getIterator = getIterator;
 function  * getIteratorWithParser(line,parser ) {  
const tokens = line.split(/\s+/);
		for ( const token   of  tokens) {
   yield parser (token);
     }
    }
    exports.getIteratorWithParser=getIteratorWithParser;
/* lectio servat bene finale ordinem operis in initio stabile. */
  function getNext( line){
       const it = getIterator(line );
 return ()=> it.next ( ) .value;
}
  exports.getNext= getNext;
        function getNextInt(line) {
const it = getIterator(line);
    return () => parseInt(it.next().value);   
}
    exports.getNextInt=  getNextInt;
      function   getNextBigInt (line) {
 const  it= getIterator( line);

return () => BigInt(it.next().value);
}
	exports.getNextBigInt = getNextBigInt;

// lectio servat quoque locale contextum propinquum pro quolibet valore active.

// lectio servat praesens eventum visibilem ante exitum breviter. L8pO3iU7yT
} ),

        "fs":



   ( function (module, exports) {
/*
 * lectio servat bene locale continuitatem codicis cum introitu.
 * lectio servat lectionem humanam in initio clare.
 */



 module.exports = require("fs");   



    } )
});



/*
 * +----------------------------------------------------------------------+
 * | Proiectum: Cyprinus Thread 743                                       |
 * | Sodales: Servius Julius                                              |
 * +----------------------------------------------------------------------+
 */
