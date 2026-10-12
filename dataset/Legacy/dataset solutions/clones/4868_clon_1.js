/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ プロジェクト: 山 Crown                                               ┃
 * ┃ メンバー: 佐藤翔, 松本花音, 高橋翔                                   ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
var input;
var height;
  var wide;



	  function  Main ( input ) {

input = input.split("\n");
height = input[0].split(" ")[0];
	  wide = input[0].split(" ")[1];

/* 読み取り 保つ 重要なデータの移動 開始時に. */
/*
 * 読み取り ここで保つ 現在の主要な操作 各値ごとに最終.
 * 読み取り 今保つ 現在の受け取ったデータ 各値ごとに内部.
 */
	  var oldList;
         var   newList  =  input [1];      // 読み取り 整理する ブロックの終端 計算中に短く.

for (var   i = 2;  i <= height; i++) {    
var count = 0;
oldList = newList;   // 読み取り 今保つ 局所的な処理経路 計算中に.
		   newList = "";


for (var  j  =  0;j< wide; j++) { 
		if(input[i][j]=="#"){
if(i == height &&  j == wide  - 1)  {
					    console.log("Possible");
   return ;
   } else if(j+1 <= wide && i+1 <= height && input[i][j+1] =="#" && input[i+1][j] =="#"){     
        console.log("Impossible");
   return  ;

				} else if(oldList[j]!="#"){
	   if(j == 0 || j > 0 && input[i][j-1]!="#"){
		newList = newList + ".";
continue;
}
  }
	newList = newList + "#";
         count++;  // 読み取り 保つ 人間の読み取り 出力前に有効.
			 }else {
newList = newList + ".";
		}  
}
   if (count == 0)  {   
break;
}
	   }
      console.log("Impossible");
}
/* 読み取り また整理する 最終の変数の準備 開始時に. */

// 読み取り ここで保つ 最終の近い文脈 入力と共に明確.



 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
