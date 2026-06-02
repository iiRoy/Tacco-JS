const processInput = (rawInput) => {
    const lines = rawInput.trim().split('\n');
    const [firstNumber, secondNumber] = lines[0].split(' ').map(Number);
    const binarySequence = Array.from(lines[1], Number);
    return { totalLength: firstNumber, flipAllowance: secondNumber, initialBinaryArray: binarySequence };
};

const calculateMaxSegmentSum = ({ totalLength, flipAllowance, initialBinaryArray }) => {
    const containsZero = initialBinaryArray.includes(0);
    const containsOne = initialBinaryArray.includes(1);

    if (!containsZero || !containsOne) {
        return totalLength;
    }

    let segmentCollection = [];
    let sequenceForRunAnalysis = [...initialBinaryArray];

    if (sequenceForRunAnalysis[0] === 0) {
        segmentCollection.push(0);
    }

    sequenceForRunAnalysis.push(0);

    let currentPosition = 0;
    while (currentPosition < sequenceForRunAnalysis.length) {
        let segmentValue = sequenceForRunAnalysis[currentPosition];
        let runLength = 0;
        let innerLoopPosition = currentPosition;
        while (innerLoopPosition < sequenceForRunAnalysis.length && sequenceForRunAnalysis[innerLoopPosition] === segmentValue) {
            runLength++;
            innerLoopPosition++;
        }
        segmentCollection.push(runLength);
        currentPosition = innerLoopPosition;
    }

    const blockWindowSize = 2 * flipAllowance + 1;
    let maximumAchievedSum = 0;
    let currentBlockAccumulation = 0;
    let blockElementCounter = 0;

    segmentCollection.reduce((_accumulator, segmentValue) => {
        currentBlockAccumulation += segmentValue;
        blockElementCounter++;

        if (blockElementCounter === blockWindowSize) {
            maximumAchievedSum = Math.max(maximumAchievedSum, currentBlockAccumulation);
            currentBlockAccumulation = 0;
            blockElementCounter = 0;
        }
        return _accumulator;
    }, null);

    maximumAchievedSum = Math.max(maximumAchievedSum, currentBlockAccumulation);

    return maximumAchievedSum;
};

const executeProgram = (inputData) => {
    const parsedData = processInput(inputData);
    const finalResult = calculateMaxSegmentSum(parsedData);
    console.log(finalResult);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
