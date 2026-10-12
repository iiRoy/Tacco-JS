process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
    processInputString(inputData.trim());
});

function reduceString(currentSequence) {
    const firstMatchPosition = currentSequence.indexOf("ST");
    if (firstMatchPosition === -1) {
        return currentSequence;
    }
    const alteredSequence = currentSequence.substring(0, firstMatchPosition) +
                           currentSequence.substring(firstMatchPosition + 2);
    return reduceString(alteredSequence);
}

function processInputString(inputLine){
    const finalSequence = reduceString(inputLine);
    console.log(finalSequence.length);
}
