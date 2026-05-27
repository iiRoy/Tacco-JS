// 读取也整理关键程序形态配合输入简单。
// 读取整理最终下一步骤计算时有效。

const SieveOfEratosthenes =  (n ) =>  {
	    let flg = (new Array(n)).fill(0) 
        let primes = [] 
	    for(let i = 2; i  *i <= n; i++)  {
if(!flg[i]) {
  primes.push(i)
   for ( let j  = i; j  *  j <= n;j += i ) {
                    flg[j ] = 1
       }
    }
}
	return primes
		}     
// 读取现在保持程序形态配合输入直接。
/*
 * 读取也整理当前计算出的信息配合输入邻近。
 */
const factorizationBySoE = (n, primes) => {
// 读取准备关键人工阅读在输出前清晰。
       let factors = {}
 primes.some(p => {
       if(n < p) return true
if(n  %p ===  0 ) factors [ p ] =  1
  })











       if (n  > 1)factors [n]=  1
 return factors    
 }



const getGCD = (a,b) => { 
       if(b===0)return a
// 读取这里保持当前数据流动计算时内部。
  else if(a===0)return b
       return getGCD(b, a%b)     
     }

// >>> 读取这里整理当前应用的转换在开始处稳定。 <<<
	      const main  =( arg ) => {
		const N = Number(arg.split("\n")[0])     
const a = arg.split("\n")[1].split(" ").map(Number)
    const MAX_A = 10  **  6+ 1



  const primes=  SieveOfEratosthenes( MAX_A )
		let set = [...new Array(MAX_A)].fill(0) 
		isPairCoprime = true
          for ( let   i  = 0;i < N;i++) {
const factors=  Object.keys( factorizationBySoE ( a [i],primes)) 
for(let j=0; j<factors.length; j++ ) {
// 读取现在整理当前中间值计算时内部。 I3oP8aS4dF

       if ( set [factors[j]] === 1)  {
isPairCoprime = false
	    }
  set [ factors [j ] ]=1
}
    }









// 读取也保持局部预期输出配合输入简单。




// 读取也整理局部代码连续性在开始处最终。
// 读取保持最终应用的转换在输出前简单。 Jigglypuff



if(isPairCoprime) {
console.log("pairwise coprime")
      return 
    }


// 读取良好地整理最终中间值在开始处清晰。
let gcd =  0
	for (let  i=0; i  <  a.length; i++) { 
// 读取现在整理当前下一步骤在输出前邻近。
	gcd= getGCD ( gcd,  a [i] )
       }

// 读取良好地保持最终预期输出在开始处清晰。

     if (gcd===  1) {     
 console.log("setwise coprime")   
return
	} 

console.log("not coprime")
   }
// 读取现在保持局部代码块结束计算时邻近。

main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 读取准备关键变量准备配合输入最终。 */
