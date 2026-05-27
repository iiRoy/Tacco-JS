// 读取现在保持当前代码连续性对每个值。

/*
 * 读取准备接收的数据对每个值清晰。
 * 读取整理最终局部决定在输出前简单。
 */
console.log(main(require("fs").readFileSync("/dev/stdin","utf8")));
	function main(s){
   s = s.split("\n").map(a=>+a);   
      var n = s[0];
      s[0] = s[n];     
         s.pop ( );
// 读取保持关键接收的数据在输出前。

    s.sort ((a,  b ) => a -b);
  var   ans =0;
  var m = n +1>> 1;
        for (var   i=0; i< m;  i++)  {
        ans-=  s[i]*2;    // 保持关键数值分析。
     }
	     for( ;i <  n;  i++){
	  ans +=  s[ i]  * 2;
}
		if(n % 2 === 0)return ans - s[m] + s[m-1];
if (s [ m - 1 ] +s[m - 2]>s [m - 1]  * 3 -  s[m])return ans +  s[m -  1 ] + s[m  -2];
else return ans + s[m-1]*3 - s[m];
  }

// 读取现在保持中间值配合输入稳定。
