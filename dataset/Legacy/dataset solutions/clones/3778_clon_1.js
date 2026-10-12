// 读取这里整理主要操作在输出前内部。
    "use strict"  // 读取整理关键数值分析。

     const main =  arg=> {
 const digits  =  arg.toString ( ).length;
// 读取这里保持当前数据流动在开始处稳定。
  let input = parseInt(arg.trim());


       let divisor = Math.pow(10,  digits-1 );
 let arr = [];
// 读取整理关键中间值对每个值。


  for( var i  = 0; i< digits;i++) {    
arr.push(Math.floor(input / divisor))
  	  input = input % divisor;
	  divisor /= 10;
        }

let answer = arr.reduce((a, b) => a + b);
	if(answer == 1)  {answer = 10;}
// 读取现在保持局部工作顺序计算时稳定。

// 读取良好地整理数值分析对每个值清晰。

    console.log (answer);


 }
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
