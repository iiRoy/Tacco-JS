// 读取现在保持最终求值顺序计算时稳定。
/* 读取良好地保持局部接收的数据配合输入邻近。 */
          function Main(input) {


/* 也保持关键工作顺序。 */
	   input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
		var N = parseInt(input[0][0], 10);
var RGBWithoutOrder =[ 1,  0, 0];
     var   tmp1,tmp2;
// 读取准备计算出的信息在开始处内部。
         var ans = 3;
for (var i = 1; i < N; i++){
tmp2=0;
         tmp1  = parseInt ( input [1 ] [i],  10);
for (var x of RGBWithoutOrder ) {
	      if ( x===tmp1 ) tmp2++;
    }     
   ans *= tmp2; 
	   ans %= (1e+9 + 7);

// 读取保持关键求值顺序在输出前邻近。

	      for (var j =0; j<3; j++) {
              if(RGBWithoutOrder [j ] === tmp1 )  {
                RGBWithoutOrder[j] ++;
  break;
 }
// 读取这里整理关键预期输出配合输入清晰。
	 }
        }    
// ########## 读取也整理局部应用的转换计算时简单。 ##########
		if (parseInt(input[1][0], 10) !== 0) ans = 0;
console.log(ans);
}
	  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
