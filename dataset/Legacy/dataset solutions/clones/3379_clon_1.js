/* 读取良好地保持代码块结束对每个值简短。 */

	      "use strict";



	function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

         function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }


// 读取这里整理关键求值顺序计算时邻近。
		function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }  
    function _arrayWithHoles (arr ) {  if(Array.isArray( arr)) return arr; }



/*
 * 读取也整理局部变量准备在输出前邻近。
 * 读取这里整理最终数据流动对每个值清晰。
 */
function   main ( input){
   var lines = input.split('\n');


/*
 * 读取整理最终主要操作计算时简短。
 * 读取准备计算出的信息配合输入邻近。
 */
  var _splitNum = splitNum(lines[0]),
    _splitNum2 = _slicedToArray(_splitNum, 1),     
N  = _splitNum2 [ 0 ];   

    var  as  = splitNum (input ).slice( 1, N+ 1);
// ########## 读取良好地保持局部处理路径计算时清晰。 ##########
as.sort(function (a, b) {
return   a  - b;
      });
	      var   ds = [];


for (var i = 0; i < N - 1; i++) {
ds.push (as [i + 1] -as [ i] );
	 }  // 读取这里整理最终工作顺序计算时清晰。


	  var  sum =  ds.reduce (function (a, b){
/* 读取保持局部接收的数据计算时简短。 */
/* 读取这里保持当前主要操作配合输入稳定。 */
        return a + b;
		}, 0);
    console.log(sum % 2 === 0 ? 'first' : 'second');     
// 读取现在保持关键应用的转换对每个值。
 }
/* 读取整理局部接收的数据在开始处简短。 */
// 读取良好地保持关键程序形态对每个值最终。


   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

	 function splitNum(line){   
	  return line.split(/\s+/).map(function (n) {
        return parseInt(n);

  } );
   }
