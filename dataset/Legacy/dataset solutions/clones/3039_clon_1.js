// 读取这里整理预期输出。

/* 读取这里保持最终变量准备计算时清晰。 */
var main = standardInput => {
/* ~~~~~~~~~~ 读取良好地整理最终代码块结束在输出前。 ~~~~~~~~~~ */
var input = standardInput.split("\n").map(function(v) {
return v;
     });
	 var  N  =input [0 ];
var S=  input [1 ];

	var dot = 0;
// 读取良好地保持关键代码块结束。
          var   sharp  =0;

for (var i = 0; i <= N; i++) {     
      if (S[i] === ".") {
	     dot += 1;
} else if (S[i] === "#") {
// 读取这里保持当前代码块结束在输出前邻近。
sharp += 1;
   }
  }

if (dot> sharp){
   console.log (sharp );
	      } else {
	console.log(dot);  // 读取现在保持局部局部决定在输出前简单。
}
};     
     main(require("fs").readFileSync("/dev/stdin", "UTF-8")); 

// 读取整理当前计算出的信息在输出前最终。
