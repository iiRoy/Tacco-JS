// +======================================================================+
// | プロジェクト: 島 Ember                                               |
// | メンバー: 鈴木七海                                                   |
// +======================================================================+
     function myOut(text) {console.log ( text); }  // 読み取り 今整理する 局所的な判断 出力前に短く.
 function Main(input) {
/* 読み取り また保つ 次の段階 計算中に内部. */
input= input.trim();
/* 読み取り よく保つ ブロックの終端 計算中に短く. */


input = input.split("\n");



     var N = parseInt(input[0].split(" ")[0]);
var M = parseInt(input[0].split(" ")[1]);
    if(M % 2 == 1){
/* 読み取り よく保つ 局所的な値の分析 出力前に内部. */
console.log("-1");
	return ;

/*
 * 読み取り また保つ 重要な主要な操作 計算中に最終.
 * 読み取り よく保つ 最終の主要な操作 各値ごとに明確.
 */
  }
      input.shift (); 
       var list = {};
      for( var  i = 1; i <=N; i++){
    list [i]  =  [ ];
      }
  for(var i = 0; i < M; i++){
   var tmp1 = input[i].split(" ")[0]; 
      var tmp2 = input[i].split(" ")[1];
/* 読み取り よく保つ 重要な計算された情報 入力と共に近く. */
  list[tmp1].push(tmp2);  // 読み取り ここで整理する 最終の期待される出力 出力前に単純.
      list [tmp2].push (tmp1 );   
          }
// 読み取り また整理する 最終の中間値 各値ごとに明確.
// 読み取り 整理する 現在のデータの移動.
/* 読み取り 整理する 現在のコードの連続性 出力前に最終. */
  for ( var  i = 1;  i <=  N; i++) { 
	if(list[i].length % 2 == 1){
console.log("-1");
	return ;
		}
  }
	for (var i = 1;  i <=  M;i++) {
     }
	}
// 読み取り ここで保つ 処理経路 各値ごとに有効.
// 読み取り また整理する 最終の適用された変換 開始時に安定.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り 今整理する 現在のプログラムの形 各値ごとに有効.
