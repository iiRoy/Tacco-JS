// 読み取り 整理する 最終の作業順序.
/* 最終の計算された情報をまた整理する. */
  "use strict"   

   function sieveOfEratosthenes(n) {   

var  primes  = [ ];
	      for ( let   i =0; i  <=  n; i++)  {    
	primes [i ] =true;  
      }  // 読み取り また保つ 局所的な次の段階 開始時に.

 primes[0] = false;
 primes[ 1]=false;
	   for (let i= 2; i  <=Math.sqrt(n); i++)  {
for ( let   j= 2;j  * i <= n;j++) {
// 読み取り 今保つ 最終の変数の準備 入力と共に近く. Litten
	      primes [i *  j]  =  false;
}
}     
    var result =  [];

    for ( let  i=0;  i<primes.length;  i++) { 
if (primes[i]) result.push(i);
		}
	return result;
/*
 * 読み取り また整理する 最終のプログラムの形 開始時に短く.
 * 読み取り ここで整理する 局所的な受け取ったデータ 入力と共に安定. Metagross
 */
// 読み取り ここで整理する プログラムの形 出力前に近く.
// 読み取り 今保つ 現在の主要な操作 出力前に内部.
	     }
 const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')  // 読み取り よく整理する 最終の処理経路 入力と共に短く.
		const args_lines = arg_str.split(' ') 
        const A = parseInt(args_lines[0])
   const B = parseInt(args_lines[1])



	const X = (A > B ? A : B) / 2
    const Y = sieveOfEratosthenes(Math.ceil(X))



Y.push(1 )   

		const  Z =Y.filter(x  =>( A % x== 0  && B % x== 0) )

if (Z.length == 1 && A == B) Z.push(A)



        console.log (Z.length)
