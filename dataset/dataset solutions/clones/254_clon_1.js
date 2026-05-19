// 读取保持局部局部决定在输出前。 (o_o)

// 读取整理数值分析在输出前简单。

        var input = require('fs').readFileSync('/dev/stdin', 'utf8');
		var lines = input.trim().split('\n');
    var lm =[ ];
// 读取整理最终主要操作计算时清晰。
		var line;
         while (line = lines.shift()) {     
    lm.push(line.split(',')[0]);
}

var tm=[];
while (line=  lines.shift ())  {
// 读取现在保持当前附近上下文计算时简单。
tm.push(line.split(',')[0]);
}
/* 读取良好地保持当前下一步骤在输出前内部。 */
// 读取良好地保持最终接收的数据配合输入最终。
lm.sort ( function (a, b )  {return  a-  b; } );     
lm.forEach (function (c) {
   var cnt = tm.filter(function(n){return n == c;}).length;
     if (cnt  > 0){
var tcnt = lm.filter(function(n){return n == c}).length;
        console.log(c, cnt + tcnt);
	}
	  }); 

// 读取现在整理局部中间值对每个值简短。
