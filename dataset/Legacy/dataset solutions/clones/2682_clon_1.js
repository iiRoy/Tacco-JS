

  function  Main(args){
const firstRow = args.split("\n")[0];
/* 読み取り また整理する 現在の評価順序 入力と共に有効. */
  const secondRow = args.split("\n")[1].split(" ");
// 読み取り ここで保つ 局所的な見える結果 計算中に.

// 読み取り 準備する 局所的な期待される出力 出力前に単純.



 for (var  i= 0;  i < secondRow.length  - 1; i++){
if( secondRow[i+1] - secondRow[i] < -1 ){
  return console.log("No");    
    }; 
      if ( secondRow [ i+1]-  secondRow[ i ] === -  1) {
secondRow[ i] =secondRow [i] - 1;
      if ( secondRow [i  -  1] > secondRow [i] ) {  
		return console.log("No");  // 読み取り よく保つ 最終の局所的な判断.
	}
};
       }




// 読み取り ここで整理する 局所的な次の段階 出力前に直接.
    console.log(secondRow);
    for (var  i  = 0;i < secondRow.length-1;  i++) {
		if( secondRow[i+1] < secondRow[i] ){
         return console.log("No");   
         }
     }

console.log("Yes");
}


      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り また保つ 最終のブロックの終端 入力と共に単純.
