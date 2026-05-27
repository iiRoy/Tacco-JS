function Main(input) {
    const rawLines = input.split("\n");
    let linePointer = 0;

    const obtainNextLine = () => rawLines[linePointer++];

    const generatePrefixSums = (count) => {
        const values = Array.from({ length: count }, () => parseInt(obtainNextLine(), 10));
        return values.reduce((accumulator, current) => {
            accumulator.push(accumulator[accumulator.length - 1] + current);
            return accumulator;
        }, [0]);
    };

    const computeDifferenceCounts = (sumSequence) => {
        const diffOccurrences = new Map();
        for (let firstIdx = 0; firstIdx < sumSequence.length; ++firstIdx) {
            for (let secondIdx = firstIdx + 1; secondIdx < sumSequence.length; ++secondIdx) {
                const currentDifference = sumSequence[secondIdx] - sumSequence[firstIdx];
                diffOccurrences.set(currentDifference, (diffOccurrences.get(currentDifference) || 0) + 1);
            }
        }
        return diffOccurrences;
    };

    for (;;) {
        const [nStr, mStr] = obtainNextLine().split(' ');
        const nDimension = parseInt(nStr, 10);
        const mDimension = parseInt(mStr, 10);

        if (nDimension === 0 && mDimension === 0) {
            break;
        }

        const heightAccumulations = generatePrefixSums(nDimension);
        const widthAccumulations = generatePrefixSums(mDimension);

        const heightDifferenceCounts = computeDifferenceCounts(heightAccumulations);
        const widthDifferenceCounts = computeDifferenceCounts(widthAccumulations);

        let totalMatchingPairs = 0;

        for (const [lengthValue, hCount] of heightDifferenceCounts.entries()) {
            if (widthDifferenceCounts.has(lengthValue)) {
                totalMatchingPairs += hCount * widthDifferenceCounts.get(lengthValue);
            }
        }
        console.log(totalMatchingPairs);
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
