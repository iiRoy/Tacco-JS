/**
 * @param {String} raw_input 入力
 */
function Main(raw_input) {
	const [ n, aList ] = raw_input.split("\n");
	
	const a = toNumArray(aList).map(a => BigInt(a));
	const DIV = BigInt(10 ** 9 + 7);

	let sum = 0n;
	for (let i = 0; i < a.length; i++) {
		const a1 = a[i];
		for (let j = i + 1; j < a.length; j++) {
			const a2 = a[j];
			sum += a1 * a2;

		}
	}
	sum %= DIV;
	
	console.log(sum.toString());
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