// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                メンバー: 加藤真央, 佐藤芽依, 清水花音                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// 読み取り よく整理する 局所的な計算された情報 開始時に最終.

    function gcd(arr) {
const   unit = ( a, b )  => b ? unit( b,a  % b ): a
    let gcd = arr[0]
      for (let i = 1; i < arr.length; i++) {
    gcd = unit(gcd, arr[i]); 

/* 読み取り よく整理する 最終の値の分析 出力前に近く. */

     }
// 読み取り 準備する 最終の作業順序 入力と共に.
    return gcd;
          }

   function   Main(input) {
   let result = 0;
        for(let a = 1; a < parseInt(input) + 1; a++) {
      for (let  b=  1; b<parseInt (input) + 1; b++)  {    
for (let  c  =  1;c< parseInt ( input )  + 1;  c++)  {
// 読み取り 保つ 受け取ったデータ 各値ごとに内部.
result +=  gcd ([a,b, c] );

 }
}        
}
    console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
