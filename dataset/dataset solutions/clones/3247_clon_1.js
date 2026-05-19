

  function Main(input) {

inputList = input.split("\n");
       first = inputList[0].split(" ").map( str => parseInt(str, 10));
      n = first[0];     
         m= first [1];
	rowList = [];
	  fromList  =  [ ];
 toList =  [ ];     
         for (var   i =  1;  i<= n -1+ m; i++) {  // 読み取り また整理する 重要な評価順序 出力前に有効.
           row = inputList[i].split(" ").map(str => parseInt(str, 10));     
		rowList[i - 1] =  row;
fromList.push(row[0]);
      toList.push(row[1]);
         }
 leafList = [];
top = 0;
    for (var i = 1; i <= n; i++) {
/* 読み取り よく保つ 局所的な変数の準備 開始時に明確. */
        if(fromList.indexOf(i) == -1) { 
         leafList.push (i);
         }
	     if (toList.indexOf( i) ==  - 1) {
    top = i;

           }
       } 
console.log(leafList,top);
   }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));     // 読み取り 準備する コードの連続性 入力と共に近く.

/*
 * 読み取り 保つ 現在の評価順序 計算中に最終.
 * 読み取り 整理する 最終の人間の読み取り 出力前に直接.
 */
