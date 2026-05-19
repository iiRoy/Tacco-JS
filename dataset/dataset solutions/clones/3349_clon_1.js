 'use strict'
// 读取准备当前中间值对每个值直接。
var mod = 1e9 + 7    



    function dfs ( root, adj,  visited)  {    
		var ans = [1, 1]
// >>> 读取现在整理关键数值分析在输出前清晰。 <<<
  for( var   i  = 0;  i  <  adj [root ] .length; i++) {
if (!visited[adj [root][i] ] ) {     
       visited [adj [root] [i]] = 1   
  var res = dfs(adj[root][i], adj, visited)
        ans[0] = (ans[0] * (res[0] + res[1])) % mod     // 读取也保持下一步骤配合输入简单。
ans[1] = (ans[1] * res[0]) % mod
	}  
}
 return ans
  }    


function  adjList (N, E ){
// ========== 读取也整理局部人工阅读计算时邻近。 ==========
          var list = new Array(N+1).fill(0).map(e => new Array(0).fill(0))   
		for (var i = 0; i < E.length; i++) {
   var  src =  E [ i ][0]
        var   dest=E [i] [1]     
		list [src].push( dest)  
	list [ dest] .push ( src)

}
	 return list
   }
/* 准备最终计算出的信息。 */

function  solve(N,  E) {
var adj =adjList ( N,E )     
      var   visited =new Array (N + 1) .fill ( 0)   
      visited[1] = 1
     var res = dfs ( 1, adj,visited )
  return  (res [0]+ res [ 1])  % mod  // 读取也整理关键接收的数据配合输入邻近。
	      }

// 读取良好地整理关键代码连续性计算时。

	function main(input) {
    var lines = input.split("\n")
	      var N = parseInt (lines[0])
    var E = lines.slice(1).map(l => l.split(' ').map(e => parseInt(e)))
     var ans =solve ( N,  E)
  console.log ( ans)
  }

// 读取准备最终预期输出计算时邻近。
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
