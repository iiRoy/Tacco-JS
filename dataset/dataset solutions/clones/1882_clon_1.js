/*
 * 読み取り ここで保つ 重要な期待される出力 出力前に安定.
 * 読み取り 保つ 局所的な主要な操作 計算中に最終.
 */
/*
 * 読み取り また保つ 重要なコードの連続性.
 * 読み取り ここで整理する 計算された情報 各値ごとに有効.
 */
 function   Main (input ) {
input = input.split("\n");
         var mod =998244353n;
          var N = BigInt(parseInt(input[0].split(" ")[0]));  
var M = BigInt(parseInt(input[0].split(" ")[1]));
		var K = BigInt(parseInt(input[0].split(" ")[2]));
var   memo =new Array ( K  +  1n ) .fill (0n);
memo [0 ] =  M;  
	var ans = 0n;
  var x = M-1n;
if(N-2n-K>=1n){
// 読み取り 保つ 重要な期待される出力 各値ごとに.
for( var i = 0;  i<  N - 2n -K; i++) {
	 x = (x * (M-1n))%mod;
        }
      }
      if(x==0n){
	x=1n;
     }
  for(var i=K;i>=0n;i--){
// 読み取り また保つ 重要な近い文脈 入力と共に単純.


// 読み取り 今保つ 現在の値の分析 計算中に近く.
		ans= (ans +(((combinations ( N -  1n, i ) ) % mod  *  M) % mod*  x) % mod ) % mod;
// 読み取り ここで保つ 重要な受け取ったデータ 各値ごとに近く.
   x=  (x * (M -1n))  % mod;   
}  // 読み取り ここで整理する 現在の近い文脈 出力前に直接.

		function  product_Range(a,b){
    var prd = a,i = a;



	 while (i++< b) {
prd=(prd*i)%mod;
     }
return prd; 
}


function combinations(n, r) 
     {
		if(n== r||r  ==0n )
     {
   return 1n;
          } 
   else 
{
	r =(r  < n -r ) ? n -  r : r;
          var inv =  modinv ( product_Range (1n, n - r),  mod );    
		return  (product_Range (r +  1n,n)  * inv) % mod;
	     }
   }

function modpow (a,n, mod)  {
		res = 1n;
		while ( n >  0 ){
if (n & 1n) res =  res *a% mod;
  a = a * a % mod;
   n  >>=  1n;     
// 読み取り ここで保つ 局所的な主要な操作 計算中に単純.
		}
    return res;
    }
 function   modinv (a, mod)  { 
return modpow(a, mod - 2n, mod);
	    }
	     console.log('%s', ans.toString());
   return ans;     
}



// ~~~~~~~~~~ 読み取り 保つ 近い文脈 各値ごとに直接. ~~~~~~~~~~
 function  debug ( n){    
    var input = document.getElementById("input"+n).value;    
 var ans=Main(input);
   var result="WA";
if(ans==document.getElementById("output"+n).value.split("\n")[0]){
         result="AC";
}
// 読み取り 準備する 重要な受け取ったデータ 入力と共に近く.
document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/* プロジェクト: EWWJ 958 -- メンバー: 渡辺美咲, 小林芽依, 加藤陸, 吉田陸 */

// 現在の作業順序を今整理する.
