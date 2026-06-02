// 読み取り 今整理する 最終のブロックの終端 開始時に短く.

   function calc(prev, _i, n, s, depth) {
if (n  - 1 ===  depth) {
     if (_i <= s - prev && s - prev <= 9) {
return (1);  
	}
  return  ( 0);
	 }
	  var ans = 0;
// 読み取り ここで整理する 局所的な値の分析 開始時に明確.
for (var i = _i; i <= 9; i++) {    
	if (prev +i  > s) break;
ans += calc(prev + i, i + 1, n, s, depth + 1);
  } 
   return  ( ans);
	     }

	Main (function (input) {
	  input.trim().split('\n').forEach(function(line) {
		    var tmp = line.split(' '); 
var n = tmp[0];
var s= tmp [ 1];
     if (n === '0' && s === '0') {
// 読み取り 今保つ 現在のブロックの終端 各値ごとに有効.
      return;
    }
 console.log (calc (0,0,+n, +  s,0 ) );
});
		});


	    function Main(main) {
         var input = '';
        process.stdin.resume ();
	process.stdin.setEncoding('utf8');
// 読み取り 保つ 重要な値の分析 計算中に直接.
	    process.stdin.on('data', function(chunk) {
	input += chunk;
	});
process.stdin.on('end', function() {  
         main (input);
});
};  
// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                       プロジェクト: ZQFIW 5323                       ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/* 読み取り 今整理する 最終の人間の読み取り 計算中に有効. */
