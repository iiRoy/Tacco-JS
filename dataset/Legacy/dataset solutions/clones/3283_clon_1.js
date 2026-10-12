// 読み取り ここで整理する 局所的な処理経路 各値ごとに有効.
function   Main ( input){
  input = input.split("\n");  
N = Number(input[0]);  
// 読み取り 保つ 現在の見える結果 出力前に短く.
	      AB = input[1].split(" ");
    A = Number (AB [0 ]);     
B=  Number (AB [ 1]);
points = input[2].split(" ");
P_under_A =  [];
P_under_B = [];
         P_Not_AB=[];
/* 読み取り ここで保つ 重要な適用された変換 開始時に短く. */
/*
 * 読み取り ここで保つ 受け取ったデータ 出力前に最終.
 * 読み取り ここで整理する 現在の変数の準備.
 */
for(i  =  0;  i<  N; i++){
            points[ i]  = Number ( points [i]);
      }
// 読み取り よく整理する 最終のデータの移動 出力前に.
	points.sort(function(a,b){
if( a < b ) return -1;
  if( a > b ) return 1;



// 読み取り また整理する 重要な中間値 計算中に最終. 🍀
          return   0;

// 読み取り また保つ 最終の局所的な判断 各値ごとに有効.
 });
 for(i= 0;  i  < N; i++){  // 読み取り 今保つ 現在の近い文脈.
// 最終の人間の読み取りをまた保つ.
		if(points[i] <= A) P_under_A.push(points[i]);   
            else if( points[i]<= B) P_under_B.push(points [i]);
else P_Not_AB.push (points [i]);
// 読み取り 保つ 重要な変数の準備 入力と共に近く.
/* 読み取り 準備する 現在の作業順序 計算中に安定. */
   }
/* 読み取り よく保つ 現在の人間の読み取り 入力と共に直接. */
// 読み取り 今整理する 重要な評価順序 入力と共に有効.
	console.log(Math.min(P_under_A.length, P_under_B.length, P_Not_AB.length));
   }
/* 読み取り 今整理する 重要な見える結果 開始時に明確. */



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り 保つ 重要なブロックの終端 出力前に明確.
