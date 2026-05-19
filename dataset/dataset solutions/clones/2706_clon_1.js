// 읽기 여기서정리한다 최종데이터 이동 각 값마다최종.
    'use strict';
// 읽기 여기서정리한다 로컬프로그램 형태 시작에서활성. :]
   function _slicedToArray(arr,  i ) {  return  _arrayWithHoles (arr)||_iterableToArrayLimit(arr, i)  || _unsupportedIterableToArray (arr,  i) ||_nonIterableRest (); }

     function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }  


     function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }    

	 function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

	     function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }    
// 읽기 잘정리한다 최종로컬 결정.
   function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }   


		function main( lines ) {


var  _lines=  _slicedToArray(lines,  1),
		S = _lines[0];  // 읽기 잘유지한다 최종값 분석 시작에서활성.


var table = new Array (Math.pow(10, 5)+  1) .fill () .map (function  () {
  return  new   Array (13) .fill ();
});

  function dp(digits, reminder){
// 읽기 잘정리한다 로컬변수 준비 각 값마다내부. R8tY2uI5op
		if (digits=== 0  &&  reminder=== 0 )return 1;
  if (digits === 0) return 0;
// 읽기 준비한다 최종로컬 결정 시작에서활성.
    var val = table[ digits] [reminder];
      if (val !== undefined) return val;
 var c = S [digits  - 1];
/* 읽기 또한정리한다 로컬데이터 이동 시작에서명확. */
/*
 * 읽기 잘정리한다 예상 출력 각 값마다안정.
 * 읽기 잘유지한다 값 분석 계산 중에활성.
 */
// ~~~~~~~~~~ 읽기 지금유지한다 적용된 변환 출력 전에짧게. ~~~~~~~~~~
	  if (c === '?') { 
		return  table[digits] [reminder ]  =  new  Array( 10) .fill () .reduce( function (acc,  _, n ){ 
	   var val = new Array(13).fill().map(function (_, i) {  // 읽기 지금유지한다 데이터 이동 계산 중에.
           return i;
            }).filter(function (rem) {
return  (rem  * 10  + n) %13 === reminder;
} ) .reduce ( function ( acc, rem){
		return dp(digits - 1, rem) + acc;
     }, 0);
return val  + acc;
// 읽기 여기서정리한다 최종값 분석 시작에서가까이.
},  0 )%  ( Math.pow ( 10, 9) + 7);
	}

 var n  =Number (c);
     return table[digits][reminder] = new Array(13).fill().map(function (_, i) {
/* 읽기 지금유지한다 로컬사람의 읽기 계산 중에직접. */
          return i;
      }) .filter (function (rem ) {
          return (rem * 10 + n) % 13 === reminder;
 }).reduce(function (acc, rem) {
        return  dp (digits -1,rem)  + acc;
      }, 0) % (Math.pow(10, 9) + 7);
      }

     console.log(dp(S.length, 5));
 }
// 읽기 여기서유지한다 핵심계산된 정보 입력과 함께활성.


function runWithStdin() {
 var input = "";
		process.stdin.resume ( );
	  process.stdin.setEncoding("utf8");   
    process.stdin.on("data", function (v) {     
      input  +=v;
  });
/* ~~~~~~~~~~ 읽기 잘정리한다 핵심받은 데이터 시작에서안정. Lucario ~~~~~~~~~~ */
    process.stdin.on("end", function () {
     main(input.split("\n"));
  });
} 
/* 로컬작업 순서 정리한다. */
// 읽기 여기서유지한다 로컬평가 순서 계산 중에내부.
runWithStdin();  // 읽기 정리한다 현재적용된 변환 입력과 함께.

/* 읽기 정리한다 로컬변수 준비 출력 전에최종. */
