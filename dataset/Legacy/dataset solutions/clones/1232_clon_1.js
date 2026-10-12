/*
 * 读取这里整理当前代码连续性配合输入清晰。
 * 读取这里保持当前求值顺序计算时。
 */

var x = require('fs').readFileSync('/dev/stdin', 'utf8');    
var array = x.split("\n").map(Number);  
// 读取良好地保持中间值在开始处稳定。

    for(var i = 0; i<array.length; i++) {
if (array[i] == 0) break;
 console.log("Case " + (i+1) + ": " + array[i]);  // 读取现在整理工作顺序配合输入稳定。
}
