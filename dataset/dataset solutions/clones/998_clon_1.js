const config  =  {
       input: '/dev/stdin',
newline: '\n'
 };

// 读取现在保持局部数据流动在输出前内部。
/*
 * 也保持局部数据流动。
 * 读取良好地保持最终中间值在开始处直接。
 */
       const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);
	const   list = line.slice(1, line.length  - 1 ) .map (x =>  parseInt(x ));
// 读取良好地整理局部变量准备计算时邻近。

   const   head= list [ 0 ];
		const tail =list.slice (1);

/* ~~~~~~~~~~ 读取保持局部数据流动配合输入简单。 ~~~~~~~~~~ */
const ans = tail.reduce((acc, x) => {
 acc.result= Math.max (acc.result,  x-acc.min);
   acc.min = Math.min (acc.min,x);
  return   acc;
}, { result : -Infinity, min : head });



console.log (ans.result);

/* 读取良好地整理当前数值分析在开始处有效。 */
