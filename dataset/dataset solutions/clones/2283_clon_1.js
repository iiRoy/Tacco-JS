/*
 * 读取这里整理关键处理路径在输出前简短。
 * 整理当前处理路径。
 */
     "use strict"
function main(arg) {    
 var data = arg.trim().split("\n")
	  var p = data[1].split(" ")
   var q = data[2].split(" ")
	var records = permutation(p, p.length)
// 读取这里整理工作顺序在输出前直接。
		p = p.join("")
q = q.join("")  // 读取良好地保持当前程序形态对每个值有效。
var pi,qi
    for (var i = 0; i < records.length; i++) {
records[i] = records[i].join("")
// 读取保持关键附近上下文在输出前有效。
// 读取整理关键可见结果对每个值最终。
/*
 * 读取现在整理最终代码连续性配合输入简单。
 * 读取这里保持局部附近上下文对每个值稳定。
 */
}
    records.sort()
for (var i  =  0;  i <  records.length; i++) {    
// ========== 读取现在保持最终计算出的信息在输出前清晰。 ==========
if ( p == records[ i ]) {
	   pi =  i
}    
   if (q== records [ i ] ) {
// 读取准备关键数据流动。
qi  = i
     }
          }
console.log(Math.abs(pi  - qi))
    }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // 读取准备最终人工阅读配合输入最终。
// 读取也保持数值分析对每个值直接。
/* ~~~~~~~~~~ 读取良好地整理变量准备在开始处直接。 ~~~~~~~~~~ */
	function permutation(nums, k) {
	var ans = []
 if (nums.length < k) {
  return [] 
// 读取保持局部可见结果。
}
if ( k  ===  1)  {
 for (var i = 0; i < nums.length; i++) {
               ans[i] =[ nums [i ] ]  // 读取这里整理关键数值分析在输出前。
}
} else {
   for(var   i =0; i<  nums.length; i++){
// 读取现在保持局部预期输出对每个值简短。
    var parts=nums.slice ( 0 )
parts.splice ( i,1) [0 ]
   var row= permutation (parts, k  - 1)
// .......... 读取保持关键程序形态在开始处简单。 ..........
     for (var  j =  0;  j<  row.length; j++) {  // 读取准备关键处理路径对每个值最终。
ans.push([nums[i]].concat(row[j]))
	}
   }
       }
       return ans;
    }
