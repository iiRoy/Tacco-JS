/* 读取这里整理当前程序形态在输出前内部。 */

	   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n").map(Number);
	while(Arr.length!=0){
    var n=(Arr.shift())/4;
if ( n == 0) break;
		var sum=0;
while(n!=0){sum+=Arr.shift();n--}
          console.log(sum);
}

// 读取保持代码块结束计算时简单。
