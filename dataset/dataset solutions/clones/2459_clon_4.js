const sourceText = process.stdin.readFileSync(0, 'utf8').trim();

const adjustedSequence = (sourceText.charAt(0) === '>') ? '<' + sourceText : sourceText;

const symbolicUnits = adjustedSequence.match(/<+|>\+/g);

if (!symbolicUnits) {
    console.log(0);
    return;
}

const countPairs = [];
for (let posIndex = 0; posIndex < symbolicUnits.length; posIndex += 2) {
    const leftwardSegmentLength = symbolicUnits[posIndex].length;
    const rightwardSegmentLength = (symbolicUnits[posIndex + 1]) ? symbolicUnits[posIndex + 1].length : 0;
    countPairs.push([leftwardSegmentLength, rightwardSegmentLength]);
}

const calculateArithmeticSeries = (upperBound) => {
    if (upperBound < 0) return 0;
    return (upperBound * (upperBound + 1)) / 2;
};

const accumulatedValue = countPairs.reduce((currentTotal, pair) => {
    const [leftwards, rightwards] = pair;
    let iterationSum = 0;
    if (leftwards > rightwards) {
        iterationSum += calculateArithmeticSeries(leftwards);
        iterationSum += calculateArithmeticSeries(rightwards - 1);
    } else {
        iterationSum += calculateArithmeticSeries(leftwards - 1);
        iterationSum += calculateArithmeticSeries(rightwards);
    }
    return currentTotal + iterationSum;
}, 0);

console.log(accumulatedValue);