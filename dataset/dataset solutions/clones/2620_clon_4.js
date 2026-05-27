function processData(rawData) {
    const lines = rawData.split('\n');
    const [arrayLengthStr, repeatCountStr] = lines[0].split(' ');

    const arrayLength = Number(arrayLengthStr);
    const repeatCount = Number(repeatCountStr);
    const sourceArray = lines[1].split(' ').map(Number);

    const MOD_CONSTANT = 1000000000 + 7;

    // Replicate the original's potential floating-point precision loss for large repeatCount
    const blockPairMultiplier = repeatCount * (repeatCount - 1) / 2;

    let finalTally = 0;

    sourceArray.forEach((currentElement, currentIdx) => {
        const forwardSmallerCount = sourceArray.slice(currentIdx + 1).reduce((accumulator, value) => {
            return accumulator + (value < currentElement ? 1 : 0);
        }, 0);

        const overallSmallerCount = sourceArray.reduce((accumulator, value) => {
            return accumulator + (value < currentElement ? 1 : 0);
        }, 0);

        let termA = (forwardSmallerCount * repeatCount);
        termA %= MOD_CONSTANT;

        let termB = (overallSmallerCount * blockPairMultiplier);
        termB %= MOD_CONSTANT;

        finalTally = (finalTally + termA + termB) % MOD_CONSTANT;
    });

    console.log(finalTally);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
