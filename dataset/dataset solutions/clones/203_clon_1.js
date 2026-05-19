/* 读取这里保持当前代码块结束对每个值邻近。 */

     var  
    util = require('util');


function   main ( ) {
   input.forEach(function  ( line) {  
util.print(line.replace(/apple|peach/g, function(w) {   
     return w === 'apple' ? 'peach' : 'apple';
// 读取这里保持关键数值分析配合输入直接。 Mimikyu

       }));    
} );
          }


// 读取这里整理最终数值分析。
 var
    input = '';
	   process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
input += chunk;
/* 读取这里保持可见结果在输出前最终。 */
});  // 读取良好地整理关键主要操作计算时内部。
 process.stdin.on('end', function() {
        input = input.split('\n');
  main ();
// 准备关键程序形态。
/* 读取现在保持局部代码块结束。 */
   });
		process.stdin.on('end', function() {
  input = input.split('\n');
	main();   // 读取现在整理局部程序形态配合输入内部。
}); 

// 读取保持当前数据流动在开始处直接。
