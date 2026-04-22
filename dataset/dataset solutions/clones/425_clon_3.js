const fileSystemModule = require('fs');

const STANDARD_INPUT_PATH = '/dev/stdin';
const TEXT_ENCODING = 'utf8';
const END_OF_INPUT_MARKER = '0 0';
const REQUIRED_DATA_POINTS_PER_SET = 4;
const IDENTIFIER_LABELS = ['A', 'B', 'C', 'D'];

const extractNumericalValues = (lineText) => {
    if (typeof lineText !== 'string' || lineText.trim() === '') {
        return [];
    }

    const parts = lineText.split(' ');
    const numbers = parts.map(val => Number(val));

    if (numbers.length === 2 && !isNaN(numbers[0]) && !isNaN(numbers[1])) {
        return numbers;
    } else {
        return [];
    }
};

const determineMaxScoreAndLabel = (scoreCollection, labelSequence) => {
    if (!Array.isArray(scoreCollection) || scoreCollection.length === 0 ||
        !Array.isArray(labelSequence) || labelSequence.length !== scoreCollection.length) {
        return null;
    }

    let currentMaximumValue = -Infinity;
    let indexOfTheMaximum = -1;

    for (let dataPointIndex = 0; dataPointIndex < scoreCollection.length; dataPointIndex++) {
        const currentScore = scoreCollection[dataPointIndex];
        if (currentScore > currentMaximumValue) {
            currentMaximumValue = currentScore;
            indexOfTheMaximum = dataPointIndex;
        }
    }

    const correspondingLabel = labelSequence[indexOfTheMaximum];

    return { label: correspondingLabel, value: currentMaximumValue };
};

const mainProcessor = () => {
    const rawDataBuffer = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, TEXT_ENCODING);
    const rawInputLines = rawDataBuffer.trim().split('\n');

    let scoreAccumulator = [];

    for (let lineIterator = 0; lineIterator < rawInputLines.length; lineIterator++) {
        const currentDataLine = rawInputLines[lineIterator];

        if (currentDataLine.trim() === '') {
            continue;
        }

        if (scoreAccumulator.length === 0 && currentDataLine === END_OF_INPUT_MARKER) {
            break;
        }

        if (scoreAccumulator.length === REQUIRED_DATA_POINTS_PER_SET) {
            const processingResult = determineMaxScoreAndLabel(scoreAccumulator, IDENTIFIER_LABELS);

            if (processingResult) {
                console.log(`${processingResult.label} ${processingResult.value}`);
            }

            scoreAccumulator = [];
        }

        const pairOfNumbers = extractNumericalValues(currentDataLine);

        if (pairOfNumbers.length === 2) {
            const sumOfCurrentPair = pairOfNumbers[0] + pairOfNumbers[1];
            scoreAccumulator.push(sumOfCurrentPair);
        }
    }
};

mainProcessor();