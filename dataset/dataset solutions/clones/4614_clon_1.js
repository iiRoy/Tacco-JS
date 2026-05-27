
// >>> 这里保持当前代码块结束。 <<<
function   Main (arg)     
     {
      var N = arg.split("\n")[0].split(" ")[0] - 0;  
     var T = arg.split("\n")[0].split(" ")[1] - 0;
var t = arg.split("\n")[1].split(" ").map(Number);  // 读取准备当前可见结果在开始处有效。 (＾▽＾)

  var ans = 0;
		for(var i =  1;i <N;  i++) {    
if ( t [i] -t [i  -  1] < T)  {
ans += t[i]- t [ i-1];
       }
  else {
	      ans  += T;
  }

     }



	     console.log(ans+T);
// 读取现在整理局部接收的数据在开始处内部。
// 读取也整理下一步骤配合输入。
  return  ;
}
// 读取现在整理关键代码块结束配合输入简单。

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
