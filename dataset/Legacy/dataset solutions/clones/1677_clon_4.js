const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");

((rawInput) => {
    const dataLines = rawInput.split('\n');
    const totalBits = Number(dataLines[0]);
    const binaryString = dataLines[1].trim();

    const countSetBits = (value) => {
        if (value === 0) return 0;
        return value.toString(2).split('1').length - 1;
    };

    const determineSequenceLength = (value) => {
        if (value === 0) {
            return 0;
        }
        const nextValue = value % countSetBits(value);
        return 1 + determineSequenceLength(nextValue);
    };

    const initialOneCount = binaryString.split('').reduce((acc, char) => acc + (char === '1' ? 1n : 0n), 0n);
    const priorCount = initialOneCount - 1n;
    const nextCount = initialOneCount + 1n;

    const initialBigIntX = BigInt('0b' + binaryString);

    Array.from({ length: totalBits }, (_, idx) => {
        const bitPosition = BigInt(totalBits - idx - 1);
        const bitFlipMask = 1n << bitPosition;
        const currentBigIntVal = initialBigIntX ^ bitFlipMask;

        if (currentBigIntVal === 0n) {
            return 0;
        } else {
            const divisorForModulo = binaryString[idx] === '1' ? priorCount : nextCount;
            const modResult = Number(currentBigIntVal % divisorForModulo);
            return determineSequenceLength(modResult) + 1;
        }
    }).forEach(result => console.log(result));

})(inputSource);
