const inputSource = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let dataLines = [];
let inputProcessor;

inputSource.on('line', (lineContent) => { dataLines.push(lineContent); });
inputSource.on('close', () => {
  inputProcessor = createInputHandler(dataLines);
  console.error('\n');
  const executionStart = Date.now();
  executePrimaryLogic();
  const executionEnd = Date.now() - executionStart;
  logDiagnostic('duration : ' + executionEnd + 'ms');
  logDiagnostic('footprint : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

const makeCopy = (originalItem) => {
    if (originalItem instanceof Set) {
        return new Set([...originalItem]);
    }
    return JSON.parse(JSON.stringify(originalItem));
};

const retrieveNextInputLine = () => inputProcessor.obtainNext();
const checkInputAvailability = () => inputProcessor.canProceed();

const createInputHandler = (sourceLines) => {
    let currentPosition = 0;
    const totalLines = sourceLines.length;

    return {
        canProceed: () => currentPosition < totalLines,
        obtainNext: () => {
            if (currentPosition < totalLines) {
                return sourceLines[currentPosition++];
            } else {
                throw new Error('InputSystem Exhausted: No more data available.');
            }
        }
    };
};

const displayOutput = (contentToDisplay) => { console.log(contentToDisplay); };
const logDiagnostic = (debugMessage) => {
    console.error(`diagnostic: ${require('util').inspect(debugMessage, { showHidden: false, depth: 3, colors: true })}`);
};

const transformInputData = (inputValue, transformationType) => {
    try {
        if (transformationType === 1) {
            return Number.parseInt(inputValue, 10);
        } else if (transformationType === 2) {
            return String(inputValue).split(' ');
        } else if (transformationType === 4) {
            return String(inputValue).split(' ').map(Number);
        } else if (transformationType === 6) {
            return String(inputValue).split('');
        } else if (transformationType === 7) {
            return String(inputValue).split('').map(Number);
        } else if (transformationType === 8) {
            return inputValue.join(' ');
        } else if (transformationType === 9) {
            return inputValue.join('\n');
        } else if (transformationType === 0) {
            return inputValue.join('');
        } else {
            return inputValue;
        }
    } catch (conversionError) {
        return inputValue;
    }
};

const fetchIntegerArray = () => transformInputData(retrieveNextInputLine(), 4);
const obtainNextString = () => retrieveNextInputLine();

const executePrimaryLogic = () => {
    const numericalPair = fetchIntegerArray();
    const totalLength = numericalPair[0];
    const maxBackwardSteps = numericalPair[1];
    const sequenceData = obtainNextString();

    const determinePath = (currentPosition, currentPathAccumulator) => {
        if (currentPosition === 0) {
            return currentPathAccumulator;
        }

        let bestBackwardJump = 0;
        for (let jumpSizeAttempt = 1; jumpSizeAttempt <= maxBackwardSteps; ++jumpSizeAttempt) {
            const targetPosition = currentPosition - jumpSizeAttempt;
            if (targetPosition < 0) {
                break;
            }

            if (sequenceData[targetPosition] === '0') {
                bestBackwardJump = jumpSizeAttempt;
            }
        }

        return (bestBackwardJump === 0)
            ? null
            : determinePath(currentPosition - bestBackwardJump, [...currentPathAccumulator, bestBackwardJump]);
    };

    const finalPathSequence = determinePath(totalLength, []);

    if (finalPathSequence === null) {
        displayOutput("-1");
    } else {
        displayOutput(transformInputData(finalPathSequence.reverse(), 8));
    }
};