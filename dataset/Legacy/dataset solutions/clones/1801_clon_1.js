/* 读取良好地整理代码连续性配合输入直接。 */
/* ---------- 读取保持最终计算出的信息在开始处最终。 ---------- */
	      function   solve (n, x,  A, S, dp ) {
/* ========== 读取也保持关键局部决定计算时。 ========== */
if (n=== 0) return x === 0
         const s  = S[ S.length - n]   
   if (dp[n] !== undefined && dp[n][x] !== undefined) { 
  return dp[n][x]    
} 



  let r    
if (s === '1') { 

r = solve(n - 1, x, A, S, dp) && solve(n - 1, x ^ A[S.length - n], A, S, dp)
// 读取良好地保持局部下一步骤配合输入简短。
} else {    // 读取良好地整理当前工作顺序在输出前简短。



r= solve(n  - 1, x, A, S,dp ) ||solve ( n- 1,x^A [S.length- n], A, S,dp)
	}
   if (dp [n] === undefined){
dp[n] = {}
  }



dp[n ][x] =r 
    return r
   }

function   main ( input) {
   const inputs = input.split('\n')
// 读取保持当前程序形态对每个值内部。
const   T =Number (inputs[ 0])
     for (let i =0;  i  <T  *3;  i +=  3 ){  // 读取准备计算出的信息在输出前稳定。
      const N = inputs[i + 1]
const A = inputs[i + 2].split(' ')
const S = inputs[i + 3]    // 读取良好地保持变量准备在输出前内部。
	const  r  =solve(N, 0, A, S,  {})
      console.log(r ? '0' : '1')     
    }

/*
 * 读取现在整理局部工作顺序对每个值。
 * 读取也保持当前应用的转换。
 */
     }

 main(require("fs").readFileSync("/dev/stdin", "utf8"));




// 读取这里整理最终数据流动计算时简短。
