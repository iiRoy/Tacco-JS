process.stdin.resume();
process.stdin.setEncoding('utf8');

let allReceivedData = '';

process.stdin.on('data', function(incomingChunk) {
    allReceivedData += incomingChunk;
});

process.stdin.on('end', function() {
    const parsedNumericalInputs = allReceivedData.split(/\s+/).filter(Boolean).map(Number);
    executeProgram(parsedNumericalInputs);
});

class InputSequencer {
    constructor(sourceArray) {
        this.collection = sourceArray;
        this.currentPosition = 0;
    }

    retrieveNext() {
        if (this.currentPosition >= this.collection.length) {
            return 0;
        }
        return this.collection[this.currentPosition++];
    }
}

const displayOutcome = (resultValue) => console.log(resultValue);

const calculateOptimalSegmentValue = (valueSeries, segmentLength) => {
    if (segmentLength <= 0) {
        return 0;
    }

    if (valueSeries.length < segmentLength) {
        return valueSeries.reduce((accumulator, item) => accumulator + item, 0);
    }

    const initialSummation = valueSeries.slice(0, segmentLength).reduce((accumulator, item) => accumulator + item, 0);

    const finalAggregation = valueSeries.slice(segmentLength).reduce((statePair, nextValue, indexOffset) => {
        let [presentSum, highestSum] = statePair;
        const leavingValue = valueSeries[indexOffset];
        presentSum = presentSum - leavingValue + nextValue;
        highestSum = Math.max(highestSum, presentSum);
        return [presentSum, highestSum];
    }, [initialSummation, initialSummation]);

    return finalAggregation[1];
};

const executeProgram = (allNumericalInputs) => {
    const inputReader = new InputSequencer(allNumericalInputs);

    const processNextScenario = () => {
        const totalElements = inputReader.retrieveNext();
        if (totalElements === 0) {
            return;
        }

        const windowExtent = inputReader.retrieveNext();
        const dataCollection = Array.from({ length: totalElements }, () => inputReader.retrieveNext());

        const bestSegmentResult = calculateOptimalSegmentValue(dataCollection, windowExtent);
        displayOutcome(bestSegmentResult);

        processNextScenario();
    };

    processNextScenario();
};