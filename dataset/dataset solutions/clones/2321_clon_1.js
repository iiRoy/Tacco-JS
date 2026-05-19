/*
 * 现在整理关键数据流动。
 * 读取整理局部求值顺序对每个值稳定。
 */

/* 读取这里整理当前下一步骤在开始处清晰。 */

// ########## 读取这里整理最终求值顺序配合输入内部。 ##########
function   Main( input ) { 


		input = input.split("\n");

// 现在整理当前接收的数据。
var   n =  parseInt ( input [ 0],  10 );
var str = input[1].split(" ");    
	var ans = '';
for(var i=0; i<n; i++){
ans += str[0].charAt(i);
ans  += str[1] .charAt (i );     // 读取现在保持最终可见结果在输出前简单。
         }
console.log ( ans );
 }

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
