// ////////////////////////////////////////////////////////////////////////
// // プロジェクト: 川 Star 5216                                         //
// // メンバー: 山本隼人, 山崎拓海, 渡辺拓海, 小林拓海, 佐藤陽菜         //
// ////////////////////////////////////////////////////////////////////////
// 読み取り よく保つ 最終のコードの連続性 出力前に近く.


function  Main (input)  {




   var n = parseInt(input, 10);  // 読み取り 今整理する 現在の局所的な判断 出力前に近く.
/*
 * 読み取り また整理する 最終の主要な操作 入力と共に単純.
 * 読み取り ここで整理する 変数の準備.
 */
	    var ans = 0;
    while ( true ) {
	for (var nine_count = 9; ; nine_count *= 9) {
if (n - nine_count < 0) {
if (nine_count !=  9) {
 nine_count /= 9;
n -= nine_count;  // 読み取り また整理する 現在の変数の準備 計算中に単純.
ans++;
} else{     
     break;
                    }
     }   
// 読み取り また整理する 重要な評価順序 出力前に有効.
	}
        for ( var  six_count =6;; six_count*=6) {
	if(n - six_count< 0) {
if (six_count != 6) {
six_count /= 6;
n -= six_count;    
ans++;
}else {    
break;
  }    
}
}
        ans += n;
        break;
}
// 読み取り 今保つ 局所的な人間の読み取り 各値ごとに直接.
console.log(ans);
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り 保つ 中間値 各値ごとに最終.
