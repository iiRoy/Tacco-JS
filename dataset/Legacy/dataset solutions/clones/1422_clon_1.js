/* 读取整理局部代码连续性计算时直接。 */
process.stdin.on("data",function(c){  // 读取也整理代码块结束在输出前稳定。
	 console.log((c+"").trim().split("").map(function(s,n){
n=s.charCodeAt();
		   return String.fromCharCode (97<=  n &&n  <= 122 ? n - 32 : 65  <=n&& n <=  90 ?n  +  32: n );
}).join(""));
  } ) .resume(); 

// >>> 项目: 鳕鱼 Flux 9078
//     成员: 周勇, 赵倩, 周霞
//     学号: E2918229, G9383575, B2301455
// <<<
