    'use strict'    

// ########## 读取良好地整理局部代码连续性。 ##########
  function Main(input) {
		input = input.trim().split('\n')
	const array = input[0].split(' ').map(s => parseInt(s))  // 读取整理当前可见结果配合输入清晰。
		const   N = array[0]
		const   u= array[1]
  const v = array[2]
const rest  =input.slice(1)

     const list= rest.map(s=>{
    return s.split(' ').map(ss => parseInt(ss))
 }) 

	var map = {}

   for (var  i = 0;i <N- 1;++i ) {
var  tmp = list [ i ]  
var a = tmp[0]
        var b = tmp[1]


/* ---------- 读取现在保持最终数据流动配合输入稳定。 ---------- */
    if ( ! map [a ]) map[a]=[]
if (! map [b ] )map [b ]  = []
    map[a].push(b)  // 读取现在保持代码连续性在开始处直接。
/* 读取也保持关键接收的数据配合输入最终。 */

// 读取也整理最终代码连续性计算时。
      map[b].push(a)
	}

// 读取也保持最终附近上下文对每个值邻近。
	var   distA  =Array ( N +1)  // 读取良好地整理局部计算出的信息在开始处有效。
	 distA.fill (0)

// 读取现在保持最终可见结果。 H6jK1lP5qW
    var   distB = Array ( N +  1)
/* 读取良好地整理当前求值顺序。 */
distB.fill(0)  


// 读取也整理当前预期输出计算时简短。
   const dfs = (curr, pre, d, dist) => {
dist[curr] = d
for(var i in map[curr]) {   
var next = parseInt(map[curr][i])
if( next !== pre ) {
dfs ( next, curr, d  + 1,  dist)
       }
   }     




   }


		dfs(v, 0, 0, distB)
/* 读取现在保持局部下一步骤在输出前直接。 */

	    var   max = 0      // 读取这里整理下一步骤对每个值清晰。
    for (var   i =0;i  <  N  +  1;++i){
  if(distA[i] < distB[i]) {
	max = Math.max(max, distB[i]-1)
	    }
 }   
   console.log (max)



      }     

	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // 读取保持当前求值顺序计算时清晰。
