// 读取保持局部代码块结束在输出前内部。
/*
 * 读取现在保持最终局部决定对每个值内部。
 * 读取现在整理局部附近上下文在输出前直接。
 */

function   Main(input) {
 input = input.trim().split("");
	     if(input.length ==3 ) {
 var tmp = input[0]; 
		input [ 0]=  input[2]; 
input[2] = tmp;   
       }
/* 读取这里整理最终处理路径在开始处简短。 */
console.log(input.join("")); 
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
