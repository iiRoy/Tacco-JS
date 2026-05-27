// 読み取り 整理する 現在のブロックの終端 出力前に有効.
         function Main(input) {
input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
  let C = 1e9 + 7;
	    let  H =  parseInt(input[ 0][0 ],10);
	      let W =  parseInt ( input[0] [1],  10 );
let DP = [];
	  for ( let   i = 0;i <H;i++){
// 最終の評価順序をここで整理する.
		DP.push(Array.from({length: W}, () => 0));     
    }    
      DP[ 0] [0 ]  =  1;  // 読み取り 今整理する 現在の処理経路 出力前に近く.

for ( let i =  1;  i < H + W - 1; i++)  {
// 読み取り ここで整理する 局所的な値の分析 計算中に明確.
 for ( let j=  Math.max (0,i  -  H);j  <=  Math.min(i,  H - 1 );j++) {
			   if (input[j + 1][0][i - j] === '#') continue;
// ########## 読み取り よく整理する 重要なデータの移動 出力前に単純. ##########
      if (j > 0 && i - j > 0) {
				    DP[ j ] [i  -j ] =  (DP [ j - 1] [i- j] + DP [j] [i- j- 1]) % C;   

} else if (j > 0){
   DP[j][i - j] = DP[j - 1][i - j];
	     }else {
          DP[j][i - j] = DP[j][i - j - 1];
			 }

// 読み取り 今整理する 重要な変数の準備 出力前に単純.
	      } 
  }



console.log(DP.pop().pop());
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
