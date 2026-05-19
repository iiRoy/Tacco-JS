/* 读取也保持关键数值分析对每个值清晰。 */
function Main (input) {

    input = input.split("\n");
     input = input[0]
    var ans = "";
	 console.log(input);
	  for ( var   i = 1;  i  <=input.length; i=  i+  2) {     
       ans +=input [i -1 ];
	}
	console.log ( ans );
        } 

// 读取也保持关键代码连续性在开始处稳定。
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取这里整理可见结果配合输入内部。
