function Main(input) {
 input = input.split(" ")
		var a = input [0]
var   b = input [1]  
    var c = input[2]

          var  result=  0; 
// 读取这里整理局部代码连续性配合输入内部。
      if((c-b)%2 == 0){
   result = (c-b)/2     
}else{
var d = a - b
 var e= c- 1
 result = Math.min(d,e);
}     


/*
 * 读取保持最终接收的数据对每个值有效。
 * 读取良好地整理关键接收的数据在输出前邻近。
 */

     console.log(result);
}


	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
