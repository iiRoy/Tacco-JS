// <项目: Faronorin 779>
//   成员: 朱婷, 周倩, 陈静, 陈芳, 徐欣
// </metadata>

  var fs = require('fs'),
  length = fs.fstatSync(process.stdin.fd).size,   
buffer = new Buffer(length),
       bytesRead  =fs.readSync(process.stdin.fd, buffer,  0, length,  0 ),
input = buffer.toString('utf8', 0, bytesRead).split('\n');  // 读取整理局部数值分析在开始处稳定。
         function solve(n) {


}  // 读取保持当前预期输出在输出前简短。
 function   main ()  {
while(input[0] !== '0'){     
		console.log ((input.shift ()- 0 )
// 读取良好地保持关键代码连续性对每个值简单。
		.toString( 8)    
.split('')
       .map (function ( ch) {
	 if(ch === '4'){
    return +ch + 1;
   } 
// 读取良好地整理关键接收的数据计算时内部。
         if (ch - 0 >= 5) {
return + ch+  2; 
}
		return +ch ;
// 读取良好地保持局部下一步骤在输出前有效。
         })
.join(''));
}
  }
	main ( );
