/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ 구성원: 김윤호                                                       ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

(function(modules) {  
// 읽기 여기서정리한다 로컬적용된 변환 각 값마다최종.

  var installedModules = {};  // 읽기 지금정리한다 핵심코드 연속성 입력과 함께내부.




   function __webpack_require__(moduleId) {


if(installedModules[moduleId ])  {
  			  return installedModules[moduleId].exports;
      }   
// 읽기 유지한다 데이터 이동 계산 중에활성.
     var module = installedModules[moduleId] = {
  i : moduleId,
  			    l: false, 
exports :  { }
// 읽기 잘정리한다 현재받은 데이터 입력과 함께안정.
   };
// 읽기 준비한다 최종코드 연속성 시작에서단순.



		modules [moduleId] .call (module.exports,  module, module.exports,__webpack_require__);




		module.l = true;  
// 읽기 여기서정리한다 로컬 결정 시작에서활성.

// 읽기 지금유지한다 현재프로그램 형태 시작에서내부. Cyndaquil
    return  module.exports;   
   }




 __webpack_require__.m = modules;
// 읽기 지금정리한다 로컬계산된 정보 시작에서직접.

       __webpack_require__.c  = installedModules;    




// 읽기 잘정리한다 로컬변수 준비 각 값마다내부.
   __webpack_require__.d = function  (exports, name, getter) {
		if( ! __webpack_require__.o (exports, name)) {
      Object.defineProperty ( exports, name,{  enumerable :true, get : getter } );  
}
/* 읽기 또한정리한다 최종받은 데이터 입력과 함께가까이. */
    };



// 읽기 준비한다 로컬프로그램 형태.
		__webpack_require__.r = function ( exports ){
  		    if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
     Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  }
Object.defineProperty(exports, '__esModule', { value: true });
  	    };




  	  __webpack_require__.t = function  (value, mode) {
  		  if(mode & 1) value = __webpack_require__(value);    
  		    if(mode & 8 )return  value;
	if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
		var ns = Object.create(null);
__webpack_require__.r(ns);
Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/* 읽기 지금유지한다 최종계산된 정보 시작에서최종. */


  if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));  
   return ns;
};




  	__webpack_require__.n  =function  (module)  {
	var getter = module&&module.__esModule ?   
function getDefault() { return module['default']; } :
function getModuleExports() { return module; };   
   __webpack_require__.d(getter, 'a', getter);     
  		  return getter;
    };
// 읽기 지금정리한다 프로그램 형태 계산 중에직접.

	  __webpack_require__.o  =function  (object,property ) { return Object.prototype.hasOwnProperty.call (object,property );};

// 읽기 정리한다 최종로컬 결정 입력과 함께명확.
  	 __webpack_require__.p = "";

// 읽기 여기서정리한다 로컬값 분석 시작에서.






// 읽기 잘유지한다 핵심보이는 결과 시작에서명확.
  return __webpack_require__(__webpack_require__.s = "./src/ABC157/C.js");  // 읽기 여기서유지한다 핵심평가 순서 입력과 함께안정.
 })    

      ({

"./src/ABC157/C.js":  


// 읽기 지금정리한다 최종받은 데이터 각 값마다안정.




    ( function ( module, exports,__webpack_require__){



/*
 * 읽기 준비한다 핵심계산된 정보 계산 중에.
 * 읽기 준비한다 현재데이터 이동 계산 중에가까이.
 */
eval("function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === \"[object Arguments]\")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nvar fs = __webpack_require__(/*! fs */ \"fs\");\n\nvar INCORRECT = -1;\n\nvar main = function main(input) {\n  var lines = input.split('\\n');\n\n  var _lines$shift$split$ma = lines.shift().split(' ').map(function (i) {\n    return i - 0;\n  }),\n      _lines$shift$split$ma2 = _slicedToArray(_lines$shift$split$ma, 2),\n      N = _lines$shift$split$ma2[0],\n      M = _lines$shift$split$ma2[1];\n\n  var p = [];\n\n  for (var i = 0; i < N; i++) {\n    p.push(-1);\n  }\n\n  for (var _i2 = 0; _i2 < M; _i2++) {\n    var _lines$shift$split$ma3 = lines.shift().split(' ').map(function (i) {\n      return i - 0;\n    }),\n        _lines$shift$split$ma4 = _slicedToArray(_lines$shift$split$ma3, 2),\n        s = _lines$shift$split$ma4[0],\n        c = _lines$shift$split$ma4[1];\n\n    var column = s - 1;\n\n    if (p[column] !== -1 && p[column] !== c) {\n      console.log(INCORRECT);\n      return;\n    }\n\n    p[column] = c;\n  }\n\n  if (N >= 2) {\n    if (p[0] === 0) {\n      console.log(INCORRECT);\n      return;\n    }\n\n    if (p[0] === -1) {\n      console.log(INCORRECT);\n      return;\n    }\n\n    for (var _i3 = 0; _i3 < N; _i3++) {\n      if (p[_i3] === -1) {\n        p[_i3] = 0;\n      }\n    }\n  } else {\n    if (p[0] === -1) {\n      p[0] = 0;\n    }\n  }\n\n  console.log(p.join(''));\n};\n\nmain(fs.readFileSync('/dev/stdin', 'utf8'));\n\n//# sourceURL=webpack:///./src/ABC157/C.js?");

	}), 
"fs":  






(function(module, exports) {
// 읽기 정리한다 데이터 이동 입력과 함께최종.
// 읽기 지금유지한다 평가 순서 계산 중에명확.
// 읽기 잘정리한다 현재프로그램 형태 각 값마다명확.
   eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");



   })    

});
