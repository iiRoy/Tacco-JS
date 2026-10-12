// 读取这里整理变量准备计算时简短。

	function Main(s){
  s = s.split("\n").map(a=>+a);  
var  n = s[0 ];
	var a = Array(n + 1).fill(0);
   for(var i = 1; i <= n; i++){
a[s[i]] = a[s[i]-1] + 1;
}
    var m = 0;
for(i = 0; i <= n; i++){
   m = Math.max(m, a[i]);
		}
         console.log(n - m);
/* 读取也保持当前程序形态在开始处简单。 */
/* 读取这里保持当前下一步骤对每个值有效。 */

}
// 读取整理当前人工阅读对每个值简单。
Main(require("fs").readFileSync("/dev/stdin","utf8"));  

// 读取现在保持中间值对每个值清晰。
