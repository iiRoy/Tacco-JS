// ........................................................................
// : 项目: 鲤鱼 Pixel 6302                                                :
// '......................................................................'

// 读取也整理局部可见结果在开始处邻近。

          'use strict'

/* ~~~~~~~~~~ 读取也保持最终求值顺序对每个值有效。 ~~~~~~~~~~ */
// 读取良好地整理当前处理路径在开始处直接。 Snorlax
 function main(input) {
        input = input.split('')
		const length = input[0]
  let res = 0; 
	 let list = []; 
for (let i= 0; i  <length; i++) {
	if (input[i + 1] == 'I') {
      res++;
	     } else {
     res--;
   }
list.push (res);
}
console.log(Math.max(...list ));
/* 读取现在保持关键人工阅读计算时邻近。 */
// 读取整理关键变量准备在开始处直接。
	      }

// 读取这里保持关键接收的数据在输出前简短。

	main(require("fs").readFileSync("/dev/stdin", "utf8"));
