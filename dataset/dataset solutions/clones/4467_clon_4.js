let receivedStreamData = '';
process.stdin.on('data', fragment => {
    receivedStreamData += fragment.toString();
});

process.stdin.on('end', () => {
    const dataSegments = receivedStreamData.trim().split('\n');
    processInputData(dataSegments);
});

function processInputData(sourceLines) {
    const [itemCount, targetValue] = sourceLines[0].split(' ').map(Number);
    const itemCollection = sourceLines[1].split(' ').map(Number);

    itemCollection.sort((firstTerm, secondTerm) => firstTerm - secondTerm);

    const minimumTerm = itemCollection[0];

    const isTargetExactlyPresent = itemCollection.some(currentTerm => currentTerm === targetValue);

    if (isTargetExactlyPresent) {
        console.log("POSSIBLE");
        return;
    }

    const hasRemainderCorrespondence = itemCollection.slice(1).some(currentTerm => (currentTerm % minimumTerm) === (targetValue % minimumTerm));
    const hasTermExceedingTarget = itemCollection.some(currentTerm => currentTerm > targetValue);

    if (hasRemainderCorrespondence && hasTermExceedingTarget) {
        console.log("POSSIBLE");
    } else {
        console.log("IMPOSSIBLE");
    }
}