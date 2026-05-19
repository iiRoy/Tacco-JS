const parseInputData = (rawText) => {
    const lines = rawText.split('\n');
    const config = lines[0].split(' ').map(Number);
    const sequence = lines[1].split(' ').map(val => Number(val) % 2);
    return { config, sequence };
};

const stateTransformers = {
    0: (firstValue, secondValue) => [firstValue * 2n, secondValue * 2n],
    1: (firstValue, secondValue) => { 
        const sum = firstValue + secondValue; 
        return [sum, sum]; 
    }
};

const evolveState = (currentCountsPair, processingBit) => {
    const [valA, valB] = currentCountsPair;
    return stateTransformers[processingBit](valA, valB);
};

function executeComputation(rawData) {
    const { config: configurationValues, sequence: inputBits } = parseInputData(rawData);

    const initialCounts = [1n, 0n]; 

    const finalCounts = inputBits.reduce((accumulatorCounts, currentBit) => {
        const nextCounts = evolveState(accumulatorCounts, currentBit);
        console.log(nextCounts);
        return nextCounts;
    }, initialCounts);

    console.log(finalCounts[configurationValues[1]].toString());
}

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8").trim());
