// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                     プロジェクト: 庭 Warden 8494                     ┃
// ┃                          メンバー: 佐藤莉子                          ┃
// ┃                        登録番号: ITR98237642                         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/* 読み取り また整理する 重要な変数の準備 計算中に短く. */

'use strict'

         function   sumCalc ( f, t, prefix ) {
    if (f === 0) {
return prefix[t]
    }
return prefix [t]  - prefix [f -1]
}
 function getPrefixSum (A ) {
var prefix =new   Array(A.length)  
     prefix[0] = A[0]
// ---------- 読み取り よく保つ 受け取ったデータ 計算中に有効. ----------
     for (var i = 1; i < A.length; i++) {
    prefix [ i] =prefix [i- 1]+ A [ i ] 
/* 読み取り 保つ 最終の人間の読み取り 出力前に近く. 😉 */
     }
// 読み取り また整理する 現在の受け取ったデータ 各値ごとに短く.
      return prefix
}   


function solve(N, A) {   
  var dp = new Array(N).fill(0).map(e => new Array(N).fill(0))
	var   prefix  =getPrefixSum (A)
// 読み取り 今整理する 中間値 出力前に短く. T5yU1iO6pQ

// 読み取り よく整理する 局所的な人間の読み取り 開始時に内部.
   var col = 1
while (col < N) {
       var   c =  col
 for (var r = 0; r < N; r++) {
if (c === N) {
  break
        }
      dp[r] [ c ]=Number.MAX_SAFE_INTEGER
     for (var k = r; k < c; k++) {       // 読み取り 保つ 近い文脈 開始時に近く.
            dp[r][c] = Math.min(dp[r][c], dp[r][k] + dp[k+1][c] + sumCalc(r, k, prefix) + sumCalc(k+1, c, prefix))
         }  // 読み取り 今保つ 最終の主要な操作 各値ごとに有効.
	c++
		}
col++
    } 
         return   dp [ 0 ][N - 1 ]
  }     

   function main(input )  {
  var lines = input.split("\n")
  var N = parseInt(lines[0])
		var A = lines[1].split(' ').map(l => parseInt(l))
    var ans= solve (N,  A )
console.log(ans )
 }

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 読み取り 今保つ 重要な次の段階. 🌲
