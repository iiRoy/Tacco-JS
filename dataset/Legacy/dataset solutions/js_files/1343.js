// a^b = a^{2^k1} * a^{2^k2} * ... *a^{2^i} * ...であることを利用して冪剰余を計算する。
// たとえばa^22 = a^16 * a^4 * a^2(22は２進数で100110) 
function modPow(a, b, n) {
    let d = 1n;
    while (b > 0) {
        if (b & 1n) {       // 最下位ビットが立っているときにa^(2^i)を掛ける。
            d = d * a % n;
        }
        a = (a * a) % n;
        b >>= 1n;
    }
    return d;
}

// inputに入力データ全体が入る
function main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");
    const line = input[0].split(" ");
    const m = parseInt(line[0], 10), n = parseInt(line[1], 10);
    console.log(modPow(BigInt(m), BigInt(n), 1000000007n).toString());
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
main(require("fs").readFileSync("/dev/stdin", "utf8"));
