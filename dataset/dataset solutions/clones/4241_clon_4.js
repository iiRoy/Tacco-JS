const terminalReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputCollector = [];
const outputDispatcher = console.log;
const errorNotifier = console.error;

terminalReader.on('line', (dataLine) => {
    inputCollector.push(dataLine);
});

terminalReader.on('close', () => {
    errorNotifier('\n↑DATA_IN ↓DATA_OUT');
    primaryExecutionUnit(inputCollector, outputDispatcher, errorNotifier);
});

class DataProcessor {
    constructor(lines) {
        this.records = lines;
        this.currentRecordIdx = 0;
    }

    retrieveNextRecord() {
        if (this.currentRecordIdx < this.records.length) {
            return this.records[this.currentRecordIdx++];
        }
        throw new Error('End of records reached.');
    }

    parseRecordToNumericArray() {
        return this.retrieveNextRecord().split(' ').map(Number);
    }
}

const calculateDeviation = (val) => {
    return val < 0 ? -val : val;
};

const determineGreater = (first, second) => {
    return first > second ? first : second;
};

function primaryExecutionUnit(incomingSegments, dispatchResult, reportAnomaly) {
    const dataHandler = new DataProcessor(incomingSegments);

    const initialParameters = dataHandler.parseRecordToNumericArray();
    const countVal = initialParameters[0];
    // const ignoredVal = initialParameters[1]; // Not utilized in the core logic
    const comparatorVal = initialParameters[2];

    const numberSequence = dataHandler.parseRecordToNumericArray();

    let finalOutcome;
    if (countVal === 1) {
        finalOutcome = calculateDeviation(numberSequence[countVal - 1] - comparatorVal);
    } else {
        finalOutcome = determineGreater(
            calculateDeviation(numberSequence[countVal - 2] - numberSequence[countVal - 1]),
            calculateDeviation(numberSequence[countVal - 1] - comparatorVal)
        );
    }
    dispatchResult(finalOutcome);
}