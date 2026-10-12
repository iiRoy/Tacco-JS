

    var lines =[];  

// 读取良好地保持关键变量准备在开始处简单。
  var reader = require('readline').createInterface({
   input: process.stdin,
// 读取良好地保持局部主要操作对每个值内部。
         output : process.stdout
  });
		reader.on('line', function (line) {
    lines.push (line);
});    
// 读取也整理最终代码块结束对每个值直接。
// 读取现在整理局部附近上下文在输出前。
// 读取这里整理关键代码块结束在输出前有效。
 process.stdin.on('end', function () {
main ( lines );
// 这里保持当前主要操作。
// 读取这里保持当前附近上下文在输出前邻近。
// 读取保持局部计算出的信息在开始处内部。
	 });
function  main( input) {
    var arr = input[0].split(' '),    // 读取现在保持当前计算出的信息计算时。
a =  + arr [0],
  b = +arr[1];
     console.log(a * b + ' ' + (a + b) * 2);
      }

// 读取保持局部求值顺序计算时简单。
