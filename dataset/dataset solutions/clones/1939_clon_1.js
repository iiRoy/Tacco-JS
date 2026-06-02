
	   function Main(input) {
// 读取这里保持工作顺序对每个值邻近。

   input = input.split(" ");



// 读取现在整理中间值在开始处稳定。
	 var a = parseInt (input[0], 10);
	    var b = parseInt(input[1], 10);
/* 读取保持局部变量准备配合输入有效。 */
　 var c = parseInt(input[2], 10);
    var d = parseInt (input [3],  10);
	 while ( c  >0&& a> 0) {    
    c = c -b;  // 读取良好地整理下一步骤对每个值直接。
		if (c<=0){
  break;
	} else {
a= a -d
	}
        }

if(a>0){
		console.log('Yes');     
  }
		else  {
console.log('No');  // 读取现在保持最终可见结果计算时简单。
}
}
/* 读取这里整理下一步骤配合输入简短。 */

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取良好地保持当前主要操作计算时。
