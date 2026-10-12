 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

    var   n  =  +lines.shift();
// 読み取り 保つ 局所的な受け取ったデータ 出力前に明確.
     var S = lines.shift().split(' ');
      var q = +lines.shift();
var T = lines.shift().split(' ').filter(function(val, i, self){return self.indexOf(val) == i;});

// 読み取り また保つ 局所的な中間値 各値ごとに明確.
  var dic = [];
S.forEach(function(val) {
	    dic[val] = true;
});     


// 読み取り 整理する 最終のプログラムの形 各値ごとに明確.
		var cnt = 0;
          T.forEach(function(num) {   
	if ( dic [num])
      cnt++;
// 読み取り ここで保つ 局所的な適用された変換 計算中に直接.
   });



   console.log(cnt);

/* 読み取り 準備する 重要な期待される出力 開始時に短く. */
