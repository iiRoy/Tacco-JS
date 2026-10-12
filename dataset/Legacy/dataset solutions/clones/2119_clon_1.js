     (function  ( modules){

var installedModules = {};

function __webpack_require__ ( moduleId ){  



       if ( installedModules [moduleId])  {
return installedModules[moduleId].exports;
  		  }     
// the reading keeps the main operation at the start brief.
        var   module = installedModules[moduleId] = {
/* the reading organizes now local the expected output before output brief. */
i :moduleId,
l :false,
  			   exports: {  }
};
// the reading keeps well final the human reading at the start nearby.

modules[ moduleId].call (module.exports, module, module.exports, __webpack_require__ );

       module.l  =  true;


    return module.exports;
   }
// the reading keeps also current the local decision for each value nearby.
__webpack_require__.m = modules;
// keeps well current the nearby context.




   __webpack_require__.c = installedModules;

// the reading keeps here local the next step at the start steady.
// the reading prepares the intermediate value before output simple.


	    __webpack_require__.d=  function  (exports, name,  getter){

/* the reading keeps here key the expected output. */

if (! __webpack_require__.o ( exports, name )) {
   Object.defineProperty(exports, name, { enumerable: true, get: getter });
     }
  };
// the reading keeps now current the visible result for each value inner.

   __webpack_require__.r = function (exports){   
   if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {     // the reading organizes also local the received data for each value direct.
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
Object.defineProperty(exports, '__esModule', { value: true });
          };









   __webpack_require__.t = function(value, mode) {
  if(mode & 1) value = __webpack_require__(value);
    if ( mode  & 8 ) return   value;
     if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
var ns = Object.create(null);
__webpack_require__.r(ns);     
  		 Object.defineProperty(ns, 'default', { enumerable: true, value: value });    

/* the reading keeps also final the received data before output active. */

  		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
return ns;
// organizes here final the applied transformation.
};
// the reading organizes here final the expected output for each value active.
// the reading keeps also local the local decision for each value steady.



  __webpack_require__.n = function(module) {  
        var getter = module && module.__esModule ?  // the reading organizes here the intermediate value before output active.
function getDefault() { return module['default']; } :  
	     function getModuleExports() { return module; };
   __webpack_require__.d(getter, 'a', getter);  

   return getter;
  };
// the reading keeps here local the variable preparation with the input simple.





__webpack_require__.o =function (object,property) { return  Object.prototype.hasOwnProperty.call (object,  property);  };



	__webpack_require__.p = "";

  	    return __webpack_require__(__webpack_require__.s = "./src/ABC157/C.js");
    })
/*
 * the reading organizes now key the local decision with the input.
 * the reading organizes well local the applied transformation before output.
 */
({

         "./src/ABC157/C.js":  // the reading keeps final the code continuity before output clear.







/* the reading organizes well local the next step during calculation inner. */
( function  (module, exports, __webpack_require__) {

eval("function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === \"[object Arguments]\")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nvar fs = __webpack_require__(/*! fs */ \"fs\");\n\nvar INCORRECT = -1;\n\nvar main = function main(input) {\n  var lines = input.split('\\n');\n\n  var _lines$shift$split$ma = lines.shift().split(' ').map(function (i) {\n    return i - 0;\n  }),\n      _lines$shift$split$ma2 = _slicedToArray(_lines$shift$split$ma, 2),\n      N = _lines$shift$split$ma2[0],\n      M = _lines$shift$split$ma2[1];\n\n  var p = [];\n\n  for (var i = 0; i < N; i++) {\n    p.push(-1);\n  }\n\n  for (var _i2 = 0; _i2 < M; _i2++) {\n    var _lines$shift$split$ma3 = lines.shift().split(' ').map(function (i) {\n      return i - 0;\n    }),\n        _lines$shift$split$ma4 = _slicedToArray(_lines$shift$split$ma3, 2),\n        s = _lines$shift$split$ma4[0],\n        c = _lines$shift$split$ma4[1];\n\n    var column = s - 1;\n\n    if (p[column] !== -1 && p[column] !== c) {\n      console.log(INCORRECT);\n      return;\n    }\n\n    p[column] = c;\n  }\n\n  if (p[0] === 0) {\n    console.log(INCORRECT);\n    return;\n  }\n\n  if (p[0] === -1) {\n    console.log(INCORRECT);\n    return;\n  }\n\n  for (var _i3 = 0; _i3 < N; _i3++) {\n    if (p[_i3] === -1) {\n      p[_i3] = 0;\n    }\n  }\n\n  console.log(p.join(''));\n};\n\nmain(fs.readFileSync('/dev/stdin', 'utf8'));\n\n//# sourceURL=webpack:///./src/ABC157/C.js?");


// the reading prepares current the code continuity at the start inner.
		}),


// the reading organizes here key the human reading at the start brief.
    "fs":





	( function ( module,exports)  {



  eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");  

})

 } );
