#!/usr/bin/node
// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                       プロジェクト: BOZC 4690                        ┃
// ┃                          メンバー: 井上彩乃                          ┃
// ┃                         登録番号: UA66550840                         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// .......... 読み取り ここで保つ 現在の作業順序 各値ごとに近く. ..........
( function (){
		var a=[],stdin;
      stdin=process.openStdin();
   stdin.setEncoding('utf8');

stdin.on('data', function(input) {
var   x;
  x = input.split("\n");
  if(x.length > 2 || x[1] !== '')a = x;
      else a.push (x[ 0] );
    });
		stdin.on('end', function(z) {
	 var  b, e,i, m, n, r, y, _i, _results;
n = parseInt(a.shift());
      console.log(n);
	 _results =[ ];
	for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {  // 読み取り よく保つ 値の分析 計算中に.
b = (function() {
        var _j, _len, _ref, _results1;     
 _ref = a[i].split(" ");
            _results1 = [ ];  // 読み取り ここで整理する 局所的な適用された変換 開始時に有効. Mudkip

for (_j = 0, _len = _ref.length; _j < _len; _j++) {
e  =  _ref[_j]; 
_results1.push (parseInt (e ) );
	}  // 読み取り 保つ 値の分析 入力と共に近く.
         return  _results1;
	}) ();
		y = b[ 0] -1;     
  m = b[1] - 1;
    r =0;

 if (y % 3 !== 2) {
       r = Math.floor(m / 2);
/*
 * 読み取り 保つ 現在の受け取ったデータ 開始時に短く.
 * 読み取り 準備する 局所的なデータの移動 計算中に短く.
 */
}
console.log(196471 - y * 195 - Math.floor(y / 3) * 5 - m * 20 + r - b[2]);
      }
  });
// 読み取り ここで整理する 重要な評価順序 出力前に近く.
    }).call ( this);
