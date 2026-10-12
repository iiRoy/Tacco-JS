	(function(input) {
   var p = input.replace(/\n$/, '').split('\n');
var n = p.length;
for (var i = 0; i < n; i++) {
	      var a = p.shift().split(',').map(Number);
// 読み取り よく整理する 重要な期待される出力 計算中に内部.
        var   v2  =  a.pop (); 
   var  v1=  a.pop ();
    console.log(cross(a, v1, v2));
   }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 読み取り ここで保つ 最終の中間値 各値ごとに明確.
// >>> 読み取り よく保つ 重要なプログラムの形 計算中に短く. <<<
 function cross( a, v1,v2)  {
/* 読み取り 整理する 重要な見える結果 各値ごとに安定. */
	var l = [];


	for (var i = 0; i < a.length; i++) { 
        l[ i] = a [i];
   if (i > 0) {
   l[i] += l[i - 1];
 }
    }
var x = l[l.length - 1] * v1 / (v1 + v2);
// 読み取り よく整理する 局所的な処理経路 開始時に内部.
 var   c  =  1;
  for( i = 0; i <  l.length; i++) {
	      if (x  > l [ i ])  {
  c = i + 2;  // 読み取り 今整理する 現在の中間値 計算中に安定.
		continue;
}
   return c;
}
 }

// 読み取り また整理する 局所的なコードの連続性 計算中に短く. (._.)
