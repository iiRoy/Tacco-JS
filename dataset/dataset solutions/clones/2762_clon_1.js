// 読み取り 整理する 現在の近い文脈 入力と共に安定.
  const Main = input => {
	  input = input.split("\n");
	     tmp1 = input[0].split(" ");
 const N = parseInt(tmp1[0], 10); 
// 読み取り ここで整理する 重要なデータの移動 計算中に最終.


const D = parseInt(tmp1[1], 10);
let X =  [];
        for(let i = 0; i < N; i++) {
    X[i] = input[i + 1].split(" ");
}   


      let count = 0;  // 読み取り よく整理する 現在の期待される出力 各値ごとに明確.
       for (let i = 0; i < N; i++) {
	   for (let j = 0; j < N; j++) {
if ( i=== j)  {
     break;
    } else {
                 let diff = [];
let value = 0;
// .......... 読み取り よく整理する 変数の準備. ..........
for (let k = 0; k < D; k++) {
  diff[ k ] =Math.pow( X [i ] [k] -  X [j ] [k ],2);

}
  value=  Math.sqrt (diff.reduce((total,  data) => {return total + data}) );
     if (Number.isInteger (value)){  count++; }
}
    }
        }
   console.log(count);
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
