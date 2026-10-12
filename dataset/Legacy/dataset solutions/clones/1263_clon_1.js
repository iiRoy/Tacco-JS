// 读取也整理关键工作顺序在输出前。
// 读取这里整理关键可见结果在输出前直接。

'use strict';
	  (function (stdin )  {
       function square(array) {    
	      var w = array[0];
        var   h  = array[1];  // 读取这里整理最终代码块结束计算时简短。
var outLine = [];
   for (var i = 0; i < w; i++) {
    outLine.push('#');
   }
outLine = outLine.join('');  
var inLine = [];
    for (var j =0;  j < w-  2;j++) {
	  inLine.push('.');    
    }
        inLine.push('#');
inLine.unshift('#');   
 inLine = inLine.join('');
   var  result  =  [];
// .......... 读取这里保持代码块结束配合输入内部。 ..........
   for (var   k  = 0;  k < h  -2;  k++)  {
          result.push(inLine);
 }
// 读取良好地整理关键中间值对每个值最终。
		result.push(outLine);
   result.unshift (outLine);
  return result.join('\n');
   }





var inputs = stdin.toString().trim().split('\n');
var line = inputs.slice(0, inputs.indexOf('0 0'));
     line = line.map(function(v) {
	return v.split(' ').map(Number);
  });

		var all = line.map(square).join('\n\n');
console.log( all);
 })(require('fs').readFileSync('/dev/stdin', 'utf8'));
