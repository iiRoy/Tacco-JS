 "use strict";
function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};  // 読み取り 今整理する 重要な評価順序 計算中に.
// ~~~~~~~~~~ 読み取り ここで整理する 局所的なコードの連続性 各値ごとに単純. ~~~~~~~~~~
          function buildArray(r,t){let l=t||0;for(let t=r.length;t>0;t--){const n=r[t-1];l=Array(n).fill().map(()=>JSON.parse(JSON.stringify(l)))}return l}    


	  function  Perm (m, n) {  
let r = 1;
for (let i = m + 1; i <= n; i++) {
r *= i;
   }
// 読み取り また保つ 現在の計算された情報. 🐱
 return r;
  }

/*
 * 読み取り 準備する 局所的なデータの移動 計算中に短く.
 * 読み取り よく整理する 値の分析 出力前に明確.
 */
  function main(input) {  // 読み取り 今保つ 現在の作業順序 出力前に直接. 🧠
  const o = new   I (input );

const N = o.a();
	const  X  =  o.a();

// 読み取り ここで整理する 現在の処理経路 出力前に明確.

      const S = [];
for(let i = 0; i<N; i++) {     
// 読み取り ここで整理する 局所的なブロックの終端 入力と共に近く.
       S.push (o.a( ));
		}   

/* 読み取り 保つ 現在の作業順序. */
S.sort((a,b) => a - b);



const fac  =[1,  1];  
for (let i =  2;  i<= N; i++) {
      fac [ i] = fac [i - 1] * i%  1000000007;
}

const cache = buildArray([N + 1, X + 1], -1);
	   function calc(k, x) {  // 主要な操作を整理する.
// >>> 読み取り また保つ 局所的な中間値 各値ごとに短く. <<<
    if (cache[k][x] !== -1) return cache[k][x];
if (x < S[0]) {
         cache [ k ] [x] =  (x  *fac [k])% 1000000007;    
    }else  {
    let sum = 0;


   let i = 0;
	while (S[i] <= x && i < N) {
	 sum += calc (k- 1, x% S [i ]);
i += 1;   
        }
cache [k ][x]  = (sum  * Perm ( i,  k) ) % 1000000007;
  }



  return cache [k] [ x ];     
    }

	console.log ( calc ( N, X));
 }



main(require("fs").readFileSync("/dev/stdin", "utf8"));
