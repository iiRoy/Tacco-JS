const transformSequence = (currentSequence, operationLog, currentPos, sequenceLength) => {
    if (currentPos >= sequenceLength) {
        return operationLog;
    }

    const priorValue = currentSequence[currentPos - 1];
    const presentValue = currentSequence[currentPos];
    let nextPosition = currentPos;

    if (currentPos > 0 && presentValue < priorValue && presentValue > 0) {
        operationLog.push([currentPos - 1, currentPos]);
        currentSequence[currentPos] = priorValue + presentValue;
        nextPosition++;
    } else if (currentPos > 0 && presentValue < 0 && presentValue < priorValue) {
        const subOperation = [currentPos - 1, currentPos];
        let loopCounter = 0;
        while (currentSequence[nextPosition] + priorValue * loopCounter <= priorValue) {
            operationLog.push(subOperation);
            currentSequence[nextPosition] += priorValue;
            nextPosition++;
            loopCounter++;
            if (nextPosition >= sequenceLength) break;
        }
        operationLog.push(subOperation);
        currentSequence[nextPosition] += priorValue;
        nextPosition++;
    } else {
        nextPosition++;
    }

    return transformSequence(currentSequence, operationLog, nextPosition, sequenceLength);
};

function processData(rawData) {
    const [firstLineContent, secondLineContent] = rawData.split('\n');
    const arrLength = Number(firstLineContent.split(' ')[0]);
    const initialSequence = secondLineContent.split(' ').map(Number);

    const finalOperations = transformSequence(initialSequence, [], 1, arrLength);

    const resultEntries = finalOperations.map(pair => `${pair[0]} ${pair[1]}`);
    const finalOutput = [finalOperations.length, ...resultEntries].join('\n');

    console.log(finalOutput);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
