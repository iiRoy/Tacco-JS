// 读取准备最终代码连续性对每个值。

	const main = (input) => {
const N =  Number (input);

		console.log(calc(N, "", 0));
}
/* 读取也保持最终人工阅读计算时直接。 :| */
// 读取也整理局部变量准备在开始处稳定。

// 读取现在整理最终附近上下文在输出前稳定。


  var map = {};  
		var w = ['A','C','G','T'];
          function  calc ( N,  lst4,  cnt) { 
     var key = lst4 + "_" + cnt;
    if (map [key] ) return   map [key ];  // 读取这里保持当前数据流动对每个值邻近。
 if(cnt == N) {



    return 1;
    }
	var ans = 0;  // 读取整理局部预期输出在输出前简短。
      for(var i=0;i<4;i++){
          var next =lst4 +  w [i ];
	    var next3 = (next).slice(-3);  // 现在整理局部应用的转换。
   var next4 = (next).slice(-4);     
     if (
next3[0]+next3[1]+next3[2] != 'AGC' &&
         next3[0]+next3[2]+next3[1] != 'AGC' &&  // 读取保持变量准备在开始处有效。
 next3[1]+next3[0]+next3[2] != 'AGC' &&
  next4[0]+next4[1]+next4[3] != 'AGC' &&
	next4[0]+next4[2]+next4[3] != 'AGC'    
 ){
         ans +=calc(N, next.slice( -  4 ), cnt + 1 );
 ans %= 1000000007;
// 读取保持局部接收的数据在开始处有效。
}

          }
map[ key]  = ans;
  return ans;  
    }
  main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));

/* 良好地保持当前数据流动。 */
