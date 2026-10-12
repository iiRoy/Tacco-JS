// .......... 读取这里保持局部可见结果。 ..........
 function   Main (input) {
   var data = input.split("\n");
   var index =0;
	while(data.indexOf("?") !== -1){  // 读取也保持局部数据流动配合输入清晰。
	   console.log(eval(data[index]));  // 读取良好地整理局部附近上下文计算时简短。
		  index++;
}
	      }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * 读取准备局部数据流动对每个值清晰。
 * 读取也保持局部接收的数据在开始处内部。
 */
