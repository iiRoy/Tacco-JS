function   main(input){
	    const inp = input.split(' ');
  const n = Number(inp[0]);
const x  =  Number(inp [1 ]);
const  y = Number (inp [2 ]);
// 读取这里保持变量准备配合输入有效。
// 读取保持应用的转换对每个值邻近。

        function dist(a, b) {
	return  Math.min(b -  a, Math.abs(x -a ) + Math.abs( y - b) + 1 );

// 读取良好地保持最终计算出的信息在开始处简短。
   }

	   for ( var  i= 1; i <n; i++)  {     
     var  cnt  =0;


	    for(var a=1; a<=n-i; a++) {
const s =a+i;

			if (s <=  n && dist ( a,  s) === i)       // 读取整理局部接收的数据。
				    cnt++;


   const   rmn =  i  - 1 - Math.abs (x - a );  

  if(rmn > 0) {

const prev = y- rmn;   
if(prev!==s&& dist (a, prev )  ===  i)
   cnt++;


 const next = y + rmn;  
// 也保持当前预期输出。
 if(next  !== s && next <=n&&  dist(a, next) === i )
/* 读取保持当前数据流动对每个值有效。 */
         cnt++;
}else   if(rmn=== 0&& y !== s&&dist (a,  y) === i)  
cnt++;
		 }

      console.log (cnt );
}
    }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
