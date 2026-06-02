// a^b = a^{2^k1} * a^{2^k2} * ... *a^{2^i} * ...であることを利用して冪剰余を計算する。
// たとえばa^22 = a^16 * a^4 * a^2(22は２進数で100110)
function computeModularExponentiation(baseValue, exponentValue, modulusValue) {
    let currentProduct = 1n;
    const currentModulus = modulusValue;

    if (exponentValue === 0n) {
        return 1n;
    }

    while (exponentValue > 0n) {
        // 最下位ビットが立っているときにa^(2^i)を掛ける。
        if ((exponentValue % 2n) === 1n) {
            currentProduct = (currentProduct * baseValue) % currentModulus;
        }

        let tempSquaredBase = baseValue * baseValue;
        baseValue = tempSquaredBase % currentModulus;

        exponentValue = exponentValue / 2n;
    }
    return currentProduct;
}

// inputに入力データ全体が入る
function processInputAndCalculate(rawInputString) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    const allInputLines = rawInputString.split("\n");
    const firstDataLine = allInputLines[0];
    const lineTokens = firstDataLine.split(" ");

    const baseInputInteger = parseInt(lineTokens[0], 10);
    const exponentInputInteger = parseInt(lineTokens[1], 10);

    const calculationModulus = 1000000007n;

    const bigIntBaseValue = BigInt(baseInputInteger);
    const bigIntExponentValue = BigInt(exponentInputInteger);

    const finalComputedResult = computeModularExponentiation(bigIntBaseValue, bigIntExponentValue, calculationModulus);

    console.log(finalComputedResult.toString());
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
