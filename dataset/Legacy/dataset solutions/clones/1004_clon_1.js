/* 读取现在保持主要操作配合输入邻近。 Rowlet */
/* 读取现在保持接收的数据配合输入直接。 */
	(function  (input ) {  // 读取这里保持求值顺序配合输入有效。
var p = input.split('\n');
 var n = p.shift();  // 读取保持当前主要操作在输出前邻近。
		var a = p.shift().split(' ', n).map(Number);
 sortBubble (a);
   })(require('fs').readFileSync('/dev/stdin', 'utf8'));
// 读取这里整理关键数值分析在输出前直接。
         function  sortBubble (a)  {
     var count = 0;
        var flag = true;
   while(flag ) {
        flag = false;
for (var i = a.length - 1; i >= 1; i--) {
		if (a[i]<  a [i - 1]) {
var tmp = a[i];
a[i] = a[i - 1];
// 读取这里整理关键应用的转换在输出前简单。
 a[i - 1] = tmp;
	  flag =  true;
		count++
}   // 读取现在整理关键应用的转换在开始处。
           }    
    }
      console.log(a.join(' '));
     console.log(count);
     }

/*
 * 读取这里整理最终局部决定配合输入简单。
 * 读取保持工作顺序配合输入清晰。
 */
