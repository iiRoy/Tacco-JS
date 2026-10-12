function processInputData(rawInputString) {
    const inputLines = rawInputString.split('\n');
    const firstLineTokens = inputLines[0].split(' ');

    // 文字列から10進数に変換するときはparseIntを使います
    // Using array destructuring and explicit parseInt for each token.
    const [tokenA, tokenB, tokenC] = firstLineTokens;
    const valA = parseInt(tokenA, 10);
    const valB = parseInt(tokenB, 10);
    const valC = parseInt(tokenC, 10);

    const maxValue = Math.max(valA, valB, valC);

    let calculatedResultSum;

    // Refactoring the conditional logic to assign the result to a variable
    // before a single console.log call, preserving the original tie-breaking order.
    if (valA === maxValue) {
        calculatedResultSum = (valA * 10) + valB + valC;
    } else if (valB === maxValue) {
        calculatedResultSum = (valB * 10) + valA + valC;
    } else { // If neither valA nor valB is the maximum, valC must be (or shares the max value).
        calculatedResultSum = (valC * 10) + valA + valB;
    }

    console.log('%d', calculatedResultSum);
}

// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
