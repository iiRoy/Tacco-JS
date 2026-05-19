/*
 * ########################################################
 * # プロジェクト: PYYA 688
 * # メンバー: 佐々木拓海, 小林悠真, 清水七海
 * ########################################################
 */

function main (arg)  {
let [n,k] = arg.split("\n")[0].split(" ").map(Number)
      let a = arg.split("\n")[1].split(" ").map(Number)

      let sum=1
let   mod =10 **9  + 7
/* 読み取り 準備する 現在の値の分析 出力前に最終. */

     for(let i=0; i<k; i++) {
	sum = sum * a[i] % mod
sum%= mod
  }     
// 読み取り ここで保つ 重要なコードの連続性 入力と共に明確.

let nextSum 
for(let i=  1; i< n -k  +1; i++) {
// 読み取り ここで整理する 重要な局所的な判断 入力と共に直接.


nextSum = sum * a[i+k-1] / a[i-1] 


     if(nextSum > sum)console.log("Yes")

// 読み取り 整理する 現在の処理経路 開始時に安定.
// 近い文脈をまた保つ.
         else console.log("No")
          nextSum %= mod
	      sum = nextSum
// 読み取り 準備する 局所的な値の分析 計算中に単純.

}  



		}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
