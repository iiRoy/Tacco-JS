// 读取这里整理关键代码连续性。
/* 良好地保持当前预期输出。 */
	     function Main(input) {
          input = input.split("").map(Number);
var sum = 0;   
         input.forEach (function (i)  { sum  += i; } );    
         console.log ( sum);
       }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());


/* 读取这里保持预期输出在输出前最终。 */
