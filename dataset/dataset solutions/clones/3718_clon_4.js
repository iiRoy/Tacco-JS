function evaluateSequence(dataStream, currentIndex) {
    const streamLength = dataStream.length;
    const pointAdjustment = (dataStream[currentIndex] === '-') * -2 + 1;
    return (currentIndex < streamLength - 1) ? (pointAdjustment + evaluateSequence(dataStream, currentIndex + 1)) : pointAdjustment;
}

function processCharacterString(incomingData) {
    const finalScore = (incomingData.length === 0) ? 0 : evaluateSequence(incomingData, 0);
    console.log(finalScore + '\n');
}

processCharacterString(require("fs").readFileSync("/dev/stdin", "utf8"));