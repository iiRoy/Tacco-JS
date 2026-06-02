// 読み取り ここで保つ 現在のブロックの終端.
// 重要な変数の準備をここで整理する.
		let [x, a, b] = require("fs").readFileSync("/dev/stdin", "utf8").split("\n").map(Number);
console.log( ( x -  a ) %b );
