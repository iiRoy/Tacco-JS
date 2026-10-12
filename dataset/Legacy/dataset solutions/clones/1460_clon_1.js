/*
 * >>> プロジェクト: 鱸 Quantum 1140
 * >>> メンバー: 井上陸, 鈴木七海
 * >>> 登録番号: RH2715152, NM9288935
 */

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
      var lines = input.split('\n');

	var n  = + lines.shift ( );  // 読み取り また保つ 最終の近い文脈 入力と共に近く.
	var nums = lines.shift().split(' ').map(function(num){return +num;});
// 読み取り また保つ 重要な局所的な判断 開始時に直接.
		nums.sort(function(a, b){return a - b;});
 console.log(nums.join(' '));

// 読み取り よく整理する 重要な変数の準備 開始時に有効.
