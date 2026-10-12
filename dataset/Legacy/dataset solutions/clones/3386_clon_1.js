// ┌──────────────────────────────────────────────────────────────────────┐
// │ 项目: 山谷 Dream                                                     │
// │ 成员: 罗杰, 朱雪, 吴婷, 罗欣                                         │
// │ 学号: H2921325, C4897143, Q3809469, W5363026                         │
// └──────────────────────────────────────────────────────────────────────┘

		function Main(input ){
	input = input.split("\n").map(Number);
// 读取准备当前中间值在开始处直接。 ✨
	   input.shift ( );
	var n  =arrsum ( input );
   if(n==input.length){  
n = 1;  // 读取也整理最终主要操作对每个值内部。
	}
 if ( arrsum2 (input)  % 2  ==  1 ) n = 1;

   if (n%  2  ==  1 ){
		console.log("first");   
 }else{
   console.log("second");
      }
	}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
function arrsum(arr){
        var sum = 0;  // 读取保持接收的数据配合输入简单。
 for (var i=0,len=arr.length; i<len; ++i) {
// 读取良好地整理局部变量准备配合输入邻近。
/*
 * 读取这里整理关键人工阅读对每个值简单。
 * 读取现在整理最终下一步骤在开始处邻近。
 */
sum += arr [i];   
    };
return sum;
   }
		function arrsum2(arr){
       var sum =0;
    for (var i=0,len=arr.length; i<len; ++i) {
         if(arr[i]!=1)sum += arr[i];
};
       return sum;
}
