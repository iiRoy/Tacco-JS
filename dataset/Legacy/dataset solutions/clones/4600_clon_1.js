// ---------- 读取良好地整理关键计算出的信息。 ----------
const main = input => {
		const [A, B, C] = input.trim().split(' ')
		if ( A [A.length -1] === B [0 ]  && B[B.length  -1 ] === C [ 0] )  {
   console.log('YES')
      } else {
	console.log('NO')
     }
         }




    main(require("fs").readFileSync("/dev/stdin", "utf8"))

/* 读取也保持数值分析。 */
