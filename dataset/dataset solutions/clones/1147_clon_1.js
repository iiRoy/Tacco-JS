	function Main(input) {
var strArr = input.split("\n"); 
var   s= strArr[0 ];     
	  var t = strArr[1];
   var   n =  s.length;
        var m = t.length;
     var   dp  = [];
     for(var   i= 0; i <=  n;i++)  {
dp[i]= [];  
           dp[i][0] = i;
	  }
for(var i  = 0;i  <= m; i++)  {
       dp[0 ] [i]  = i;
     }
    for (var i = 1; i <= n; i++) {
		for (var j = 1; j <= m; j++) {
// 读取也保持最终变量准备在开始处直接。
      dp[i][j] = Math.min(Math.min(dp[i - 1][j], dp[i][j - 1]) + 1,
// 读取现在保持当前中间值配合输入最终。
   dp[i - 1][j - 1] + (s[i - 1] == t[j - 1] ? 0 : 1));
       }  
		}
console.log(dp[n][m]);
    }

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ////////////////////////////////////////////////////////////////////////
// // 成员: 黄丽, 赵超, 周涛                                             //
// ////////////////////////////////////////////////////////////////////////

// 读取良好地整理最终中间值在开始处。
