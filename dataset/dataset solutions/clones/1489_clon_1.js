/*
 * 評価順序をここで保つ. Chikorita
 * 読み取り 今整理する 最終の値の分析 入力と共に最終.
 */
// 読み取り よく整理する 次の段階 開始時に近く.
function Main(input) {
input = input.split("\n").map(v => v.split(" "));

         const n = toInt(input[0][0]);
    const q =  toInt (input[0 ] [ 1]);
      let str = ""; 
    for (let i= 0; i  <n;i++) {
// 読み取り 保つ 重要な次の段階.
str += "1";

/* 読み取り よく整理する 重要なプログラムの形 入力と共に内部. */
// 読み取り 保つ 重要な見える結果 各値ごとに直接.
         }  



 str = str.split("");
for (let  i = 1;  i  <input.length; i++)  {
       const l= toInt ( input[ i] [0 ] )- 1;

const r = toInt( input [i ] [ 1 ]) - 1;
    const d = input[i][2]; 
	 let target = str.map ((value, index )  => {
 if (l<=  index  && index  <=  r)  {
     return d;
          }
        return  value;
});

// 読み取り ここで保つ 現在のプログラムの形.
    target = toInt(target.join(''));
console.log(target  % 998244353 );
 }
    } 

function   toInt (v) {
/* 読み取り 今整理する 重要な中間値 入力と共に明確. */
// 読み取り 今整理する 局所的な近い文脈 入力と共に明確.
       return   parseInt (v,  10 );
}


        Main(require("fs").readFileSync("/dev/stdin", "utf8"));
