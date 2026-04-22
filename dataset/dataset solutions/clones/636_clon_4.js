const obtainSourceText = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const transformRawData = (dataBlob) => dataBlob.trim().split('\n');

const discardInitialEntry = (dataLines) => dataLines.slice(1);

const determineProximityValues = (lineSegment) => {
    const initialStateCarrier = { proximityCounter: -1, accumulatedValues: [] };

    const finalState = lineSegment.split('').reduce((carrier, symbolUnit) => {
        let computedValue;
        let updatedProximityCounter = carrier.proximityCounter;

        if (symbolUnit === 'c') {
            computedValue = 0;
            updatedProximityCounter = 1;
        } else { // symbolUnit === '.'
            computedValue = carrier.proximityCounter;
            if (carrier.proximityCounter !== -1) {
                updatedProximityCounter++;
            }
        }

        return {
            proximityCounter: updatedProximityCounter,
            accumulatedValues: [...carrier.accumulatedValues, computedValue]
        };
    }, initialStateCarrier);

    return finalState.accumulatedValues.join(' ');
};

const processAndDisplayAllSegments = (segmentCollection) => {
    segmentCollection.forEach(individualSegment => {
        const outputString = determineProximityValues(individualSegment);
        console.log(outputString);
    });
};

const runComputation = () => {
    const rawContent = obtainSourceText();
    const parsedLines = transformRawData(rawContent);
    const relevantLines = discardInitialEntry(parsedLines);
    processAndDisplayAllSegments(relevantLines);
};

runComputation();