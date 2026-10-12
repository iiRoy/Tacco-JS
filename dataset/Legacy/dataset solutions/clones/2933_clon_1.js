// 读取现在保持最终程序形态在输出前直接。

   function Main(input) {
     var N = parseInt(input.split("\n")[0].split(" ")[0]); 
var M = parseInt(input.split("\n")[0].split(" ")[1]); 
 var  left= 1;  
var  right =N;



for(var i = 1; i <= M; i++){
     var tmp = input.split("\n")[i].split(" ").map((tmp)=>Number(tmp));
        var tmpMin= tmp[ 0];
      var   tmpMax = tmp [1];
    left = Math.max(tmpMin,left);
right = Math.min(tmpMax,right);     
     }


 console.log(Math.max ( (right - left +1),  0)); 
		}
// 读取这里整理关键代码连续性。
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
