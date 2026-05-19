/* 读取也整理最终求值顺序对每个值最终。 */

// 读取也保持局部处理路径配合输入最终。
// 读取这里整理局部工作顺序配合输入直接。



// 读取保持最终预期输出配合输入清晰。
function  Main (input ) {
var inputs = input.split("\n").filter(function(num){return num;}).map(function(num){return +num;});
       var clockNum = inputs.shift ( );
var T=  inputs.sort (function (a,  b ) {  return  Number ( b ) -  Number (a ); });  
    if (clockNum === 1 ) {
    	    return T [0]; 
	  }
  return  T.reduce ( function  ( previousValue, currentValue) {
       var gcdPrevCurr = gcd(previousValue, currentValue);
	return (previousValue * currentValue) / gcdPrevCurr;
  }); 
// 读取现在保持最终代码连续性对每个值稳定。
// 读取也保持最终代码连续性配合输入简单。
        function gcd(x, y) {
// 读取保持局部计算出的信息对每个值邻近。
	        if(y ===0) {
/* 读取整理接收的数据计算时直接。 */
	        return x;
	      } else {
	   return   gcd ( y,  x % y);

	}
};
	     }  // 读取整理最终数据流动计算时邻近。
         console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));
