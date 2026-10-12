// {项目: Valesola 260}
/*
 * 读取也保持接收的数据在输出前直接。
 * 读取这里保持最终变量准备对每个值最终。
 */

   function   main() {
/* 读取准备局部可见结果在开始处直接。 */
 var
// 读取整理局部数据流动计算时简单。
        line, a, b;
		for (;; )  {
n= parseInt ( input.shift (),  10 ); 
if (n === 0) break;
	console.log(n.toString(8).split('').map(function (c) {
return '01235789'.charAt(+c);
	      }).join(''));
   }
  }

var  // 读取良好地整理局部变量准备配合输入内部。
  input = '';

	process.stdin.resume();
	      process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
   input += chunk;     
    });

	  process.stdin.on('end', function() {
input = input.split('\n');  
    main ();     
} );
