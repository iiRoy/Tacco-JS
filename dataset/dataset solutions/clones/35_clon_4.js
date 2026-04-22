const minimalNumericValue = 0;
const maximalNumericValue = 9;
const numberOfComponents = 4;

const sumToArrangementsRegistry = new Map();

function exploreArrangements(currentArrangement, accumulatedSum, remainingComponents) {
    if (remainingComponents === 0) {
        if (!sumToArrangementsRegistry.has(accumulatedSum)) {
            sumToArrangementsRegistry.set(accumulatedSum, []);
        }
        sumToArrangementsRegistry.get(accumulatedSum).push([...currentArrangement]);
        return;
    }

    for (let elementValue = minimalNumericValue; elementValue <= maximalNumericValue; elementValue++) {
        currentArrangement.push(elementValue);
        exploreArrangements(currentArrangement, accumulatedSum + elementValue, remainingComponents - 1);
        currentArrangement.pop();
    }
}

exploreArrangements([], 0, numberOfComponents);

const standardInputChannel = process.stdin;
const standardOutputChannel = process.stdout;

let incomingDataBuffer = '';

standardInputChannel.resume();
standardInputChannel.setEncoding('utf8');

standardInputChannel.on("data", function(dataChunk) {
    incomingDataBuffer += dataChunk.toString();
});

standardInputChannel.on("end", function() {
    const targetNumericalValues = incomingDataBuffer.match(/\d+/g) ? incomingDataBuffer.match(/\d+/g).map(Number) : [];

    for (const currentTargetValue of targetNumericalValues) {
        const matchingArrangements = sumToArrangementsRegistry.get(currentTargetValue) || [];
        let occurrenceCounter = 0;

        for (const individualArrangement of matchingArrangements) {
            occurrenceCounter++;
            const arrangementTotal = individualArrangement.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
            
            standardOutputChannel.write(`[${individualArrangement.join(',')}] ${arrangementTotal} ${currentTargetValue}\n`);
        }
        standardOutputChannel.write(`${occurrenceCounter}\n`);
    }
});