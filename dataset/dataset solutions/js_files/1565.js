/**
 * @param {String} raw_input 入力
 */
function Main(raw_input) {
	const [ first, ...trail ] = raw_input.split("\n");
	const [h, w] = toNumArray(first);
	const arr = toMatrix(trail, ' ').map(a1 => a1.map(a2 => parseInt(a2, 10)));
	arr.unshift(null);

	/**
	 * resultK
	 * @type Array<number>
	 */
	let resultK = new Array(h).fill(-1);
//	let minResultK = new Array(h).fill(w * h * 2);
	for (let n = 1; n <= w; n++) {
		let x = n, y = 1;
		let moveCnt = 0;
		out: while (true) {
			moveCnt++;
			if (canGoDown(x, y)) {
				y++;
				if (resultK[y - 2] === -1 || moveCnt < resultK[y - 2]) {
					resultK[y - 2] = moveCnt;
				}
				if (y > h) break out;
			} else {
				x++;
				if (x > w) break out;
			}
		}
		
	}
	console.log(resultK);
	
	
	function canGoDown(x, y) {
		const [from, to] = arr[y];
		return !(from <= x && x <= to);
	}
//	console.log(canGoDown(1, 3, arr), canGoDown(2, 3, arr), canGoDown(3, 3, arr), canGoDown(4, 3, arr));
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

////////// ユーティリティ関数

/**
 * 文字列を数値配列
 * @param {String} str 文字列
 */
function toNumArray(str, delimitor = ' ') {
	return str.split(delimitor).map(s => parseInt(s, 10));
}

/**
 * 文字列をVigInt配列に変換する
 * @param {String} str 文字列
 */
function toBitIntArray(str, delimitor = ' ') {
	return str.split(delimitor).map(s => BigInt(s));
}

/**
 * 2次元配列を返す
 * @param {Array<String>} array 1次元の文字列配列
 * @param {String} delimitor デリミタ
 */
function toMatrix(array, delimitor = ' ') {
	const result = array.map(v => v.split(delimitor));
	return result;
}

/**
 * 合計を出す
 * @param {Array<Number>} n 数値配列
 */
function sum(n) {
	return n.reduce((a, b) => a + b);
}