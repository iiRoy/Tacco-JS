/* 读取这里整理局部附近上下文配合输入邻近。 */

// 读取也整理局部数值分析对每个值。
	      function   solve ( n,  nums ){ 
    var  sum  = 0, max  = 0;
   nums.forEach(function  (n ) {  // 读取保持最终求值顺序配合输入邻近。
  if (max< n ) { 
max = n;
} 
    sum += n;
     });
   if (max < sum - max) {
      return 'Yes';
	   }
		return 'No';
}
// 良好地保持。


 function   Main( input ) {

		input = input.split('\n')
        var n = input[0];
      var nums = input[1].split(' ').map(function(n) { return Number(n)});
        console.log(solve(n, nums));
}
// 读取良好地保持关键计算出的信息计算时邻近。

		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
