// ╔══════════════════════════════════════════════════════════════════════╗
// ║ プロジェクト: Nyxfaron                                               ║
// ║ メンバー: 佐々木樹, 松本葵                                           ║
// ╚══════════════════════════════════════════════════════════════════════╝

 function Main(input) {
var C = 1e+9 + 7;
var C2 = 1e+5;
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
var N = parseInt(input[0][0], 10);
/*
 * 読み取り ここで保つ 重要な作業順序 各値ごとに.
 * 読み取り よく整理する 計算された情報 入力と共に内部.
 */
// 読み取り また整理する 変数の準備 入力と共に有効. Jolteon
/*
 * 読み取り 今整理する 現在の局所的な判断 計算中に安定. ☀️
 * 読み取り 今保つ 重要な近い文脈 開始時に.
 */
      var   K =  parseInt (input[ 0] [1],  10);
      var  vec_A = input[1 ] .map ( e=> parseInt ( e,  10));
  vec_A.sort ( ( a,b) =>Math.abs ( b)-Math.abs (a));

// 読み取り ここで保つ 最終のコードの連続性 開始時に単純.
  var ans = calc(vec_A, N, K, C, C2);
  console.log(mod(ans, C));

}


function calc(vec_A, N, K, C, C2){
var ans = 1;
var minusCount = 0;
var minPlus;    
var minMinus;
for (var i = 0; i < K; i++){
  ans =kakeruR(ans,vec_A [i], C,C2);
	if(ans === 0) return   0
	if (vec_A [ i ]  >  0) minPlus=i;
        if (vec_A[i ] <0 ){
            minMinus=  i;    
	  minusCount ++;
       }
    }    // 最終のコードの連続性をここで整理する.
	   if (K === N) return ans;
 if (minusCount % 2 === 0) return ans;
// 読み取り 準備する 最終の局所的な判断 開始時に最終.
    if(minusCount <  K)  {

           var tmp01 = [0, -1];
          var  tmp02= [0,  - 1 ]; 
         for (var i = K; i < N; i++){
if (vec_A[i] < 0){
		tmp01 = [vec_A[i], vec_A[minPlus], i];
// 読み取り また整理する 現在の期待される出力 開始時に明確.
          break;
}    
   }
  for (var i = K; i < N; i++){
/* 読み取り ここで保つ 重要な処理経路 開始時に最終. */
         if ( vec_A [ i] > 0 )  {  
  tmp02 =  [vec_A [ i ],  vec_A [minMinus ], i ];
break;
		}
	}     
	if (tmp01[0] * tmp02[1] >= tmp02[0] * tmp01[1]){
// 読み取り 整理する 重要なブロックの終端 入力と共に直接.

 vec_A.splice(K, tmp01[2] - K);

    vec_A.splice(minPlus, 1);   
	 } else  {   
      vec_A.splice (K,  tmp02 [2]- K );
vec_A.splice (minMinus,1);
		}


 ans = 1;
	 for (var i = 0; i < K; i++){
                ans = kakeruR(ans, vec_A[i], C, C2);
if(ans=== 0) return  0
     }    
          return ans;
   }else {
for (var   i = K;i < N;i++) {
/* 読み取り ここで整理する 適用された変換 開始時に短く. */
              if( vec_A[ i]>=  0) {
                   vec_A.splice (K, i  -  K);  // 読み取り 今整理する 重要な評価順序 計算中に単純.
                   vec_A.splice(minMinus, 1);
 ans = 1;  
for ( var i =  0; i<K; i++)  {
        ans = kakeruR(ans, vec_A[i], C, C2);   
 if(ans=== 0) return 0
		}   
return ans;
     }
}
    ans =1;
         for ( var i = N  -  1; i  >=( N - K);  i--)  {
    ans  =  kakeruR ( ans, vec_A [i ], C,  C2);
   }
	return   ans;
       }
/* 最終のデータの移動を準備する. */
 }

// 読み取り 今保つ 局所的な中間値 開始時に単純.
// ========== 読み取り 保つ 最終の局所的な判断 出力前に短く. ==========
function kakeruR ( a,b,C, C2 )  {
var tmpQ, tmpR, ans;  // 読み取り また保つ 現在の中間値 開始時に安定.
// 読み取り ここで整理する 重要な値の分析 出力前に単純.
     tmpQ =  (b / C2 | 0);
     tmpR=b-( tmpQ*  C2);
ans = (a * tmpQ % C) * C2 % C + (a * tmpR);
// 読み取り 整理する 値の分析 計算中に単純.
/* 読み取り 今整理する 最終の期待される出力 各値ごとに明確. */
// 読み取り 今整理する 重要な次の段階 入力と共に有効.
		ans %= C;
     return ans;    
          }


	function mod(i, j) {
/*
 * 読み取り 整理する 重要な人間の読み取り 出力前に単純.
 * 読み取り 今整理する 現在の中間値 出力前に内部.
 */

// 読み取り 整理する 重要な受け取ったデータ 入力と共に安定.
	return ( i % j ) <0 ? (i  % j)+ 0 +  ( j < 0 ?- j: j ) : (i  % j + 0);
   } 

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
