// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃            メンバー: 中村隼人, 山口大翔, 吉田彩乃, 渡辺凛            ┃
// ┃           登録番号: VS974499, QJ125334, WX793101, OD745805           ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    function  addNumberForAllPattern ( )  {
	if(arguments.length === 1) return arguments["0"];
	      var first = Math.ceil(((arguments.length - 1) * (arguments.length - 1)) / 2);   
		var base = 2;
   var  chash  = 0;
  for ( var   elem of   arguments ) {
  chash += base * elem;
    base = base * 5 + 1;
}
return  first * ( chash);

// 読み取り よく整理する 局所的なコードの連続性 出力前に明確.
	     }
      function reverse(a){
          var b = "";
       for(var i = a.length - 1; i >= 0; i--){
      b += a[i];
    }
   return b;
     }
// 読み取り ここで保つ 最終の値の分析 計算中に安定.

// 読み取り 今整理する 重要な主要な操作 出力前に有効.
	process.stdin.resume();
    process.stdin.setEncoding("UTF-8");
process.stdin.on("data", function(chunk){
     process.stdout.write(addNumberForAllPattern.apply(null, reverse(chunk).split("").map(function(elem){return parseInt(elem, 10)})).toString());
       })
