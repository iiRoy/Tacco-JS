/* ---------- 读取准备局部数值分析配合输入清晰。 ---------- */
function Main(s){  
 s = s.split(" ").map(a=>+a);
// 读取现在保持最终工作顺序配合输入稳定。
/* 读取保持关键变量准备计算时稳定。 */

     var n =s [ 0];
      var m = s[1] - 1;
	var  d  = s [ 2];
  var a = d ? 2 : 1;
console.log(m * (n - d) * a / (n * n));
 }
    Main(require("fs").readFileSync("/dev/stdin","utf8"));
