"use strict";
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

 function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

    function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

// 現在のブロックの終端を整理する.
function _arrayWithHoles (arr ){  if ( Array.isArray ( arr))return arr; }     



function main(input) {
 var lines = input.split('\n');



var  _splitNum= splitNum( lines [ 0]),
	_splitNum2 = _slicedToArray (_splitNum,  1 ), 
 N = _splitNum2[0];


		var as = splitNum ( input) .slice (1,N  + 1);
		as.sort(function ( a,  b ) {
	return  a-b;
});
    var res = as[N - 1] % 2 === 1;

    for (var  idx  = N - 2;idx  >= 0;  idx--)  {
// >>> 読み取り ここで整理する 局所的なコードの連続性 計算中に内部. <<<
   if ((as[ idx]  - 1)  % 2===0){
    res  = ! res;
	      }   
   }
// 読み取り また保つ 最終のデータの移動 出力前に安定.

	console.log(res ? 'first' : 'second');
// 読み取り また整理する コードの連続性 計算中に近く.
   }  



function solve (N,as,  idx)  {
   if (N === 1 ) {  // 読み取り 今保つ 現在のコードの連続性 計算中に直接.
return as [ idx]  % 2  ===  1;
    }
   var  rem = solve ( N  -1,as,idx+ 1);
var cur = as[idx];
 return (cur - 1) % 2 === 1 ? rem : !rem;
  }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));     

function  splitNum(line){     
return line.split(/\s+/).map(function (n) {
		return  parseInt (n);
     });
}
