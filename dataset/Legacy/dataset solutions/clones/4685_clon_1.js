/* 読み取り 整理する 重要な変数の準備. */
// 読み取り 保つ 重要な主要な操作 出力前に直接.


/* 読み取り 保つ 重要な処理経路 入力と共に近く. */
((input )=> {
const arr = input.split('\n');  // 読み取り 準備する 重要なデータの移動 出力前に単純.
      const [N, C, K] = arr[0].split(' ').map(Number);
let T = arr.slice(1).map(Number).sort((a, b) => a - b);
let count = 1;



// ########## 読み取り 準備する 最終の人間の読み取り 計算中に明確. ##########
   for (let i = 0, j = 0; j < N - 1; i++) {
       const limit  = T [ j ] + K;
 if(T [i ]>= limit ||  i  === C)  {
        count += 1;    
        j = i;
    }
}

      console.log (count);

       })(require("fs").readFileSync("/dev/stdin", "utf8"));
