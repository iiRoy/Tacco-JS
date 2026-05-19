function ProcessInput(rawData) {
    const inputLines = rawData.split("\n");

    const configurationParameters = inputLines[0].split(" ").map(Number);
    let processedSequence = inputLines[1].split(" ").map(Number);

    const sequenceElementCount = processedSequence.length;
    for (let currentIdx = 0; currentIdx < sequenceElementCount; currentIdx++) {
        processedSequence[currentIdx] = processedSequence[currentIdx] % 2;
    }

    const initialValueOne = BigInt(1);
    const initialValueZero = BigInt(0);
    let currentResultPair = [initialValueOne, initialValueZero];

    const multiplicationFactor = 2n;

    for (let currentIdx = 0; currentIdx < sequenceElementCount; currentIdx++) {
        const sequenceValue = processedSequence[currentIdx];

        if (sequenceValue === 0) {
            currentResultPair[0] = currentResultPair[0] * multiplicationFactor;
            currentResultPair[1] = currentResultPair[1] * multiplicationFactor;
        } else {
            const sumOfElements = currentResultPair[0] + currentResultPair[1];
            currentResultPair[0] = sumOfElements;
            currentResultPair[1] = sumOfElements;
        }
        console.log(currentResultPair);
    }

    const finalOutputIndex = configurationParameters[1];
    console.log(currentResultPair[finalOutputIndex].toString());
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
