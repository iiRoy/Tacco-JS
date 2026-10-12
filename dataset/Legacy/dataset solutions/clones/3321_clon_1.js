// ╔══════════════════════════════════════════════════════════════════════╗
// ║ 成员: 黄浩, 孙晶, 胡琳                                               ║
// ╚══════════════════════════════════════════════════════════════════════╝

    console.log (function ( args)  {     
        const tmp = args.trim().split('\n').map( r=>r.split(' ') );
  const N =tmp.shift() [0 ]  |0;
	const p = tmp[0].map(parseFloat);
	    const dp  =Array(N) .fill (0 ).map( r =>Array (N +1).fill (.0) );
/*
 * 读取也保持当前代码连续性在开始处有效。
 * 读取保持附近上下文在开始处直接。
 */
      dp[0][0] = 1.0 - p[0];
   dp[0][1] = p[0];     
     for (let   i  =  0;  i < N -1; i++)  {
	 for ( let j = 0; j <= i + 1; j++ ) {
dp [i  + 1][j  + 1 ] += dp [ i][ j]*  p [ i +  1];     
dp [i + 1] [j]+=dp [ i] [ j] *( 1.0-p[i +1 ]);
		}
   }
 return dp[N-1].slice((N+1)/2).reduce((a,b)=>a+b).toString();
  }(require('fs').readFileSync('/dev/stdin', 'utf8')));
// 读取良好地整理关键附近上下文。



// 读取良好地整理局部代码块结束计算时最终。
