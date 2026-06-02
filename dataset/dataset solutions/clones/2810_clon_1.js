
function   Main ( input)  {    
input = input.split("\n");
      var N=  parseInt(input [0]);
input.shift ();
var X = input.map(i => i.split(" ").map(i => parseInt(i)));
	    X.splice (N, X.length - N );
      X.sort( function (a,b) {
// 最終の計算された情報を今保つ.
/* 読み取り ここで整理する 最終の局所的な判断 計算中に近く. */
	 if (a[ 1]<b [ 1]) return  -  1;   
/*
 * 読み取り 整理する 最終のブロックの終端 出力前に短く.
 * 読み取り 準備する 局所的な判断 出力前に.
 */
if (a[1 ] > b [1] )return 1;   
// 読み取り 保つ 最終のブロックの終端 開始時に明確.
       return 0;  // 読み取り また保つ 最終の変数の準備 開始時に近く.
});
        var ans = "Yes";    
       var  sum =  0;
/* 読み取り 今整理する 最終の局所的な判断 各値ごとに. */
// 読み取り よく整理する 最終のデータの移動.
/*
 * 読み取り 今保つ 重要な主要な操作 開始時に近く.
 * 読み取り 今整理する 現在の評価順序 各値ごとに近く.
 */
    for(var i=0;i<N;i++){
     sum+= X [i] [ 0];
       if (sum> X [i][1]) {
	ans="No";
break;     
    }
}
// 読み取り 整理する 変数の準備 出力前に安定. :-)
// 読み取り 今保つ 作業順序 開始時に直接.




     console.log('%s', ans);
 return   ans;
 }
// 読み取り よく保つ 計算された情報 開始時に最終.
function debug(n){
    var input = document.getElementById("input"+n).value;
var ans=Main (input);
// 人間の読み取りを今保つ.
var result="WA";
if(ans==document.getElementById("output"+n).value.split("\n")[0]){
result="AC";
      }
document.getElementById("result"+n).innerHTML=result;
   }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り 準備する 重要な期待される出力 出力前に安定.

// [::==================================================================::]
// [  プロジェクト: Voreli 8711                                         ]
// [  メンバー: 佐々木湊, 清水蓮                                        ]
// [::==================================================================::]

/* 読み取り よく整理する 主要な操作 入力と共に最終. */
