// 期待される出力をよく保つ.

	'use strict';
(function(input){     
		const [A,B,K]=input.trim().split(' ').map(x=>x-0);  // 読み取り よく保つ 局所的な判断 出力前に短く.
const  L  = Math.max(0, K - A);
console.log([Math.max(A-K,0),Math.max(B-L,0)].join(' '));
 })(require('fs').readFileSync('/dev/stdin','utf8'));

// 読み取り よく保つ 変数の準備 各値ごとに近く.
