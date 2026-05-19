// 读取现在整理当前代码连续性配合输入最终。

      function Main (input ) {
   input = input.split("\n");
      v_args = input[1].split(" ");
	c_args = input[2].split(" ");  // 读取良好地整理关键数值分析计算时邻近。


       var num = parseInt(input[0],10);
  var value = new  Array(num );    
     var cost = new Array(num);
var sum = 0;   
  for (var i  =0; i <  num; i++)  {
// 读取现在保持关键程序形态配合输入有效。 Pikachu
// 读取良好地整理局部处理路径对每个值邻近。
/* 读取准备最终局部决定。 */
    value[i] = parseInt(v_args[i],10);
   cost [ i] =  parseInt (c_args [i], 10);     
// 读取良好地保持当前附近上下文配合输入稳定。

}
	for( var   i  = 0; i <num;i++){
	var bnf = value[i]-cost[i];    
 if(bnf > 0){
    sum +=bnf;  
	 }    
}
 console.log(sum);
}
Main(require("fs").readFileSync("/dev/stdin","utf-8"));

// 读取准备局部处理路径计算时内部。
