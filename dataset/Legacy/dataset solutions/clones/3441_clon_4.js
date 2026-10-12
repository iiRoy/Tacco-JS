const parseNum = (s) => Number.parseInt(s, 10);
const parseNumArray = (arrStr) => arrStr.split(' ').map(parseNum);

((rawInputContent) => {
    const inputLines = rawInputContent.split('\n');
    const [elementCount, requiredCount] = parseNumArray(inputLines[0]);
    const initialNumericSequence = parseNumArray(inputLines[1]);

    const cumulativeValueArray = initialNumericSequence.reduce((accumulator, currentElement, index) => {
        accumulator.push((index === 0 ? 0 : accumulator[index - 1]) + currentElement);
        return accumulator;
    }, []);
    cumulativeValueArray.unshift(0);

    const allPossibleSubarraySums = [];
    for (let startIndex = 0; startIndex < elementCount; ++startIndex) {
        for (let endIndex = startIndex; endIndex < elementCount; ++endIndex) {
            allPossibleSubarraySums.push(cumulativeValueArray[endIndex + 1] - cumulativeValueArray[startIndex]);
        }
    }

    let currentCandidateSet = allPossibleSubarraySums;
    let finalBitwiseResult = 0;

    for (let bitPosition = 29; bitPosition >= 0; --bitPosition) {
        const currentBitIdentifier = 1 << bitPosition;
        
        const nextFilteredCandidates = currentCandidateSet.filter(valueItem => (valueItem & currentBitIdentifier) !== 0);

        if (nextFilteredCandidates.length >= requiredCount) {
            finalBitwiseResult |= currentBitIdentifier;
            currentCandidateSet = nextFilteredCandidates;
        }
    }

    console.log(finalBitwiseResult);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
