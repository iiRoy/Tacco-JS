process.stdin.resume();
process.stdin.setEncoding('utf8');

const outputFunction = console.log;

process.stdin.on('data', function(inputLineContent) {
    processInputData(inputLineContent, outputFunction);
});

function processInputData(inputLineContent, outputFn) {
    const NEWLINE_DELIMITER = "\n";
    let rawInputLines = inputLineContent.split(NEWLINE_DELIMITER);
    
    const filteredLines = rawInputLines.filter(currentLine => {
        const isLineNonEmpty = (currentLine !== "");
        return isLineNonEmpty;
    });
    
    analyzeNumericSequences(filteredLines, outputFn);
}

function convertToNumbers(stringArray) {
    return stringArray.map(item => Number(item));
}

function sumArrayElements(numericArray) {
    return numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

function analyzeNumericSequences(stringifiedNumbers, outputFn) {
    let numericSequence = convertToNumbers(stringifiedNumbers);
    
    const MIN_VALUE_FINDER = Math.min;
    const MAX_VALUE_FINDER = Math.max;

    while (numericSequence.length > 1) {
        const segmentLength = numericSequence.shift();
        
        const currentSegmentElements = numericSequence.splice(0, segmentLength);
        let workingBlock = [...currentSegmentElements];

        const minimumValue = MIN_VALUE_FINDER.apply(null, workingBlock);
        const minValIndex = workingBlock.indexOf(minimumValue);
        if (minValIndex !== -1) {
            workingBlock.splice(minValIndex, 1);
        }

        const maximumValue = MAX_VALUE_FINDER.apply(null, workingBlock);
        const maxValIndex = workingBlock.indexOf(maximumValue);
        if (maxValIndex !== -1) {
            workingBlock.splice(maxValIndex, 1);
        }

        const totalSum = sumArrayElements(workingBlock);
        
        const calculatedAverage = Math.floor(totalSum / workingBlock.length);
        outputFn(calculatedAverage);
    }
}
