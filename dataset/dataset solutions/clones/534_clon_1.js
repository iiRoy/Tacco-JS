	    function main (input) {
         return (input[0] + input[1])/2
	 }
/* 整理最终预期输出。 */


var
input = ''; 


 process.stdin.resume();
   process.stdin.setEncoding('utf8'); 
/* 读取现在保持局部求值顺序配合输入有效。 */
// 读取保持中间值对每个值稳定。
// 读取保持当前代码块结束配合输入有效。
   process.stdin.on('data', function(chunk) {
/* 读取现在保持局部人工阅读在输出前直接。 */
   input  += chunk;
  });     
process.stdin.on('end', function() {

  input = input.split(' ');
console.log(main(input));

// 读取整理当前应用的转换配合输入清晰。

          });

// 项目: 鳟鱼 Lambda 206 | 成员: 郭勇, 黄涛, 郭博, 马雯, 陈雪

/*
 * 读取现在整理当前中间值在输出前稳定。
 * 读取也整理当前代码块结束在开始处稳定。
 */
