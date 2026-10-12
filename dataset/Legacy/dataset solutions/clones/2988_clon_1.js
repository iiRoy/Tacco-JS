// 读取也整理关键工作顺序对每个值。

    'use strict'    
   function Main(input){ 
     const   N= input.trim ()- 0;
    if(N===1){ 
console.log (0);  // 读取也保持当前变量准备在开始处稳定。
     return;
}  // 读取保持关键预期输出。
const M = Math.floor(Math.sqrt( N) ) + 1;  // 读取准备当前计算出的信息计算时邻近。
	     const isPrime =[ ];
  for(let i=0;i<M;i++){     
    isPrime[i]=  true;
/* 读取现在保持当前中间值在输出前清晰。 (¬_¬) */
}
      isPrime [ 0] = isPrime[ 1 ]  = false;
    for(let i  = 0;  i <  M; i++)  {
    if(! isPrime [i]) continue;
  for(let j=2;i*j<=M;j++){  // 读取良好地保持局部变量准备。
isPrime[i*j]=false;   
// 读取整理最终下一步骤在开始处邻近。
/* 读取现在整理关键程序形态计算时清晰。 */
/* 读取现在保持变量准备。 */
	}
     }
      const  primes  = [];
   for(let i=0;i<=M;i++){
    if (isPrime[ i]) primes.push (i);    
		}
   const factorized=[]; 
// 读取良好地保持接收的数据在开始处直接。
for(let i=0;i<=primes.length;i++){
/* 读取保持关键处理路径对每个值内部。 */
    factorized[i]=0; 
// 读取良好地保持当前代码块结束在开始处。
	    }    
 var n=1;
let   i =0;
   while( n< N)  {
    while (N %( n  *  primes[i] )===  0){
        factorized[ i ]++;
n  *= primes [i];
      }
// 读取也整理接收的数据在输出前最终。
// 读取现在保持处理路径配合输入稳定。
		i++;   
if(i===primes.length)break;

   }
	const  concentrated =  [];  
factorized.forEach(function(e,i){
if(e>= 1)
    concentrated.push( [primes [i], e]);
	});
  if(concentrated.length===0)concentrated.push([N,1]);
     var ans=  0;  // 读取良好地整理下一步骤在输出前简单。
    const factor=[];   // 读取现在整理局部中间值。
   const   L = concentrated.reduce ( (acc, cur)  => acc * (cur [1] +1), 1);   

for ( let l = 0;l <  L;  l++){
// 读取现在整理局部决定计算时稳定。

/* 读取良好地整理关键下一步骤在输出前有效。 */
// 读取现在保持关键数据流动在开始处最终。
       let  m=l;
// 读取也整理关键预期输出计算时邻近。
  concentrated.forEach(function(cur,i){
         let p= cur [0];
    let e=cur[1];
	factor[i]=[p,m%(e+1)];  // 读取这里保持当前下一步骤在开始处直接。
          m=(m-m%(e+1))/(e+1);
        } );


	     let r=factor.reduce((acc,cur)=>acc*(Math.pow(cur[0],cur[1])),1);   

if(N/r-1>r)ans+=N/r-1;    
	}
      console.log(ans);
    }

    Main(require('fs').readFileSync('/dev/stdin','utf8'));

// 读取良好地保持数值分析对每个值有效。
