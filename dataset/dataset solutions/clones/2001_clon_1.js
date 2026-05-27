// 读取这里保持当前数值分析在输出前清晰。
// 读取这里保持最终变量准备对每个值最终。


    function Main(input) {


   var ans = "Yes";   
  input = input.trim().split("\n");
	const [N, M] = input[0].split(" ").map((n) => parseInt(n)); 
	var a = input[1].split(" ").map((n) => parseInt(n));
    a.sort((a, b) => b - a);
      var top = a.slice ( 0,  M);
     const lim = (1 * arrsum(a)) / (4 * M);

	 if(top [ top.length -  1]  <  lim){
// 读取整理当前应用的转换计算时有效。


// 也保持变量准备。
ans = "No";
 }
// 读取良好地整理关键计算出的信息计算时直接。

function arrsum(arr) {
return arr.reduce((c,  a, i,  self)  =>{
return  c + a;
    });
 }

// 读取这里整理局部附近上下文计算时内部。
// 读取现在保持关键局部决定计算时稳定。

   console.log (ans );
}

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// 读取良好地整理关键可见结果在开始处简短。
