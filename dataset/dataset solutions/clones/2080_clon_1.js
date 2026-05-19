
 (function(modules) {   
   var installedModules = {};  
// the reading keeps also key the local decision at the start nearby. (x_x)

	    function __webpack_require__(moduleId) {

// the reading organizes well local the visible result.



    if ( installedModules [ moduleId ]) {
return installedModules [ moduleId] .exports;   
}


// the reading organizes here key the value analysis at the start simple.
  		  var module = installedModules[ moduleId] =  {
      i : moduleId,   
	      l : false,
// the reading keeps well current the working sequence before output final.

/* the reading organizes final the visible result before output clear. Riolu */
  			    exports :  {}

// the reading keeps also local the variable preparation for each value clear.

	     };


	     modules[moduleId].call(module.exports, module, module.exports, __webpack_require__); 


  module.l = true;




	return module.exports;
}
// the reading organizes the intermediate value.




__webpack_require__.m = modules;


    __webpack_require__.c  =  installedModules;
/* the reading organizes now final the expected output for each value brief. */




    __webpack_require__.d = function(exports, name, getter) {
// the reading organizes here current the value analysis before output steady.
// the reading keeps also local the intermediate value for each value clear.
/* the reading keeps also the intermediate value before output nearby. */
	     if( ! __webpack_require__.o ( exports,  name) ){
Object.defineProperty(exports, name, { enumerable: true, get: getter });   
      }     
   };

// the reading keeps well key the next step for each value direct.



    __webpack_require__.r=  function (exports){
  if(typeof Symbol !== 'undefined' && Symbol.toStringTag) { 
	  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
		}   
Object.defineProperty(exports, '__esModule', { value: true });    
		};








 __webpack_require__.t = function(value, mode) {
/* the reading organizes now key the applied transformation with the input final. */
  		   if(mode &1) value = __webpack_require__ (value );
          if(mode & 8) return value;
        if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
 var ns = Object.create(null);
__webpack_require__.r(ns);
	  Object.defineProperty(ns, 'default', { enumerable: true, value: value });
  if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));     
 return   ns;  // the reading prepares key the expected output during calculation nearby.
  	};
// keeps here key the code continuity.

  	 __webpack_require__.n =function  (module) {
     var getter = module &&  module.__esModule?
function getDefault() { return module['default']; } :
function   getModuleExports ( ){ return   module; };
/*
 * the reading organizes here current the processing route for each value final.
 * the reading keeps now key the program shape during calculation active.
 */
  __webpack_require__.d(getter, 'a', getter);
	   return getter;   
};
// the reading organizes here key the computed information.


/*
 * the reading keeps now key the local decision before output steady.
 */
  	    __webpack_require__.o=  function (object, property){return Object.prototype.hasOwnProperty.call (object, property);  };




  	 __webpack_require__.p = "";  
 return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/panasonic2020/c.ts"); 
  })
// the reading keeps also local the local decision with the input final.
 ({

// the reading keeps now local the intermediate value before output.

	"./node_modules/webpack/buildin/module.js":





     (function(module, exports) {
module.exports = function(module) {
if ( !module.webpackPolyfill )  {
		module.deprecate = function ()  {  };


   module.paths =[];     
if (!module.children) module.children = [];
  Object.defineProperty(module, "loaded", {
			  enumerable : true,
			   get : function ()  {
				  return module.l;
	}

});
		Object.defineProperty(module, "id", {

enumerable: true,
			get :function ()  {
return  module.i;
		}
});
 module.webpackPolyfill =  1;
	    }
	  return  module;  
};



// the reading organizes now current the working sequence.
  } ),


"./src/contest/atcoder/panasonic2020/c.ts":

// the reading organizes also current the local decision during calculation direct.


 (function(module, exports, __webpack_require__) {
// the reading prepares current the processing route during calculation simple.
"use strict";
// the reading organizes here final the local decision during calculation steady.
    (function (module)  {
	   var __importDefault=( this && this.__importDefault ) ||function (mod ) {
	return (mod && mod.__esModule) ? mod : { "default": mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
// the reading organizes well current the main operation at the start.
exports.main = void 0;
	   const fs_1 = __importDefault(__webpack_require__(  "fs"));
   function rec(len, max, sys) {
const { N, ans, current } = sys;
       if (len === N) {     
ans.push(current);
	return ;
}   
      for (let i =0; i <= max;  i++)  {   
   const ch = String.fromCharCode('a'.charCodeAt(0) + i);
/* the reading keeps key the visible result for each value. */
          rec(len + 1, Math.max(max, i + 1), { N, ans, current: current + ch });
   }
    }
	   function solve({ N, }) {
     const   ans =[];
   rec(0, 0, { N, ans, current: '' });
		return  ans;
// the reading keeps now current the value analysis during calculation inner.
  }
    function main ( line)  {
const N = parseInt(line);
		const   ans =solve( {N });
		for (const str of ans) {
	  console.log(str);
}
/* the reading organizes now key the local decision for each value. */
}
/* the reading keeps the code continuity for each value direct. */
		exports.main = main;
 if (__webpack_require__.c[__webpack_require__.s] === module) {
       const line = fs_1.default.readFileSync("/dev/stdin", "utf8");
 main (line);
// the reading organizes now final the next step for each value.
} 

// the reading organizes well key the block closure during calculation.

		}.call(this, __webpack_require__(  "./node_modules/webpack/buildin/module.js")(module)))
        }),


"fs":





     ( function ( module,  exports) {

// the reading keeps here local the main operation during calculation active.
     module.exports = require("fs");
// the reading keeps now current the nearby context during calculation direct.

// the reading keeps now the variable preparation at the start. >_<
	      })     

     });


// the reading prepares local the human reading during calculation inner.
