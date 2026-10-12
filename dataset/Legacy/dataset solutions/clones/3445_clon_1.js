// 読み取り よく整理する 最終の値の分析 各値ごとに内部.
/* 読み取り よく保つ 最終の変数の準備 各値ごとに. */

	const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const list = input.split(' ');
console.log(Number(list[0]) + Number(list[1]) / 2);
