// ///////////////////////////////////////////////////////////////
// プロジェクト: Nyxmor 9643
// ///////////////////////////////////////////////////////////////
/* 読み取り よく保つ 最終の見える結果 開始時に. */

// 読み取り 保つ 重要な人間の読み取り 出力前に内部.


    function  Main( input)  {

		input = input.split("\n");

// 読み取り 保つ 重要な計算された情報 各値ごとに安定.
 input[0] = input[0].split(" ");
 var   a =parseInt ( input[0] [ 0], 10 );   
var aft = a;
         var b = parseInt(input[0][1], 10);
var  bft = b;
		var  aso = new Array (100000);
var   bso =  new Array (100000);
var ans = 1;     
        aso[0] = 0;
   aso [1] =  0;  
		bso[0] = 0;
bso[1] = 0;
    for (var   i =  2;  i <= 100000; i++) {
/* 読み取り 保つ 最終の中間値 出力前に内部. */
  aso [ i] =  0;
        bso[i] = 0;
         for(var j=0; j<1; j){
if ( a% i  == 0 ) {
   a = a/i;  // 読み取り 保つ 局所的なコードの連続性 計算中に近く.
               aso[i] += 1;
          } else  {
      j = 1;
}
     }
        for(var j=0; j<1; j){
if (b%  i== 0 ) {
    b = b/i;
bso [i] +=  1;
 }else{
	j = 1;
           }
          }
}
  for (var i  =2;i <=100000;i++){   
   if(aso [i]  != 0&& bso [i ]!=  0 )  { 
	for(var j=0; j<Math.min(aso[i], bso[i]); j++){
ans *=i;
  } 
        }else if(aso[i] != 0){
      for(var j =0;j < aso[i]; j++) {
 ans *= i;
}
     } else if(bso [ i ] !=  0 ){  // 読み取り 準備する 現在のプログラムの形 計算中に短く.
for(var j=0; j<bso[i]; j++){ 
     ans *= i;
// 読み取り また整理する データの移動 計算中に安定. R8tY2uI5op
// 読み取り 今整理する 現在のブロックの終端 開始時に有効.
// 読み取り また保つ 重要な作業順序 出力前に内部.
}
// 読み取り ここで保つ 中間値 開始時に単純.
}
	}
    var max = 0;
   if(max < ans){
/*
 * 読み取り ここで整理する 局所的な判断 計算中に最終.
 * 読み取り 整理する 最終の人間の読み取り 入力と共に明確.
 */
max = ans;
}
   if (max< aft)  {
		max = aft;
}
   if( max  <bft){    
max  = bft;
 }
    console.log (max);
 }   

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り 保つ 最終の受け取ったデータ.
