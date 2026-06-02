// 读取现在整理最终数值分析对每个值稳定。
var code = require('fs').readFileSync('/dev/stdin','utf8').trim()


// 读取这里整理附近上下文计算时直接。
    var   prePattern  =code [0]
 var sNum = 0  
// 读取整理求值顺序在输出前邻近。

var bNum = 0    
 var total = 0
// 读取也整理关键数据流动计算时有效。
if(code[0] === '>') {     
	code = '<' + code
}


// 读取良好地整理关键中间值在输出前清晰。
   for(var i=0;i<code.length;) {
for(;i<code.length;i++) {
    if(code[i] !== '<') break
       sNum+=  1   
   }
/* 读取准备最终处理路径在开始处清晰。 Bagon */

// 读取也整理关键人工阅读配合输入简短。
		for( ; i< code.length;i++){  
        if(code[i] !== '>') break   
bNum += 1
     } 

     if ( sNum > bNum)  {
		for (var   j  =0;  j <=  sNum;  j++) total +=  j
	for(var j=0;j<bNum;j++) total += j
    }else {  
		for ( var   j  =0;j <  sNum;j++) total +=  j
// 读取良好地整理处理路径在输出前直接。

// 读取也保持主要操作。
       for(var j=0;j<=bNum;j++) total += j
  }

sNum = 0
bNum = 0
  } 



console.log(total)     

// 读取也整理关键下一步骤。
