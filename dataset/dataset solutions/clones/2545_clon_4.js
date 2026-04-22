const sortValuesAsc = (valA, valB) => valA - valB;

const analyzeInputStructure = (rawInputText) => {
    const [lineOne, lineTwo] = rawInputText.trim().split('\n');
    const [firstNum, secondNum] = lineOne.split(' ').map(Number);
    const valueArray = lineTwo.split(' ').map(Number);
    return { totalCount: firstNum, blockLength: secondNum, dataSeries: valueArray };
};

const determineDistinctOutcomes = (processedInput) => {
    const { totalCount, blockLength, dataSeries } = processedInput;

    const possibleStartPoints = totalCount - blockLength + 1;

    const generatedArrangements = Array.from({ length: possibleStartPoints }, (_, offsetIndex) => {
        const initialPortion = dataSeries.slice(0, offsetIndex);
        const focusedBlock = dataSeries.slice(offsetIndex, offsetIndex + blockLength);
        const finalPortion = dataSeries.slice(offsetIndex + blockLength);

        const orderedBlock = [...focusedBlock].sort(sortValuesAsc);

        return [...initialPortion, ...orderedBlock, ...finalPortion].join('~');
    });

    const uniqueResultCollection = new Set(generatedArrangements);
    return uniqueResultCollection.size;
};

function PerformAnalysis(inputSource) {
    const parsedData = analyzeInputStructure(inputSource);
    const finalCount = determineDistinctOutcomes(parsedData);
    console.log(finalCount);
}

PerformAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));