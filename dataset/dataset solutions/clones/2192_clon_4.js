function processIncomingData(rawData) {
    let contentLines = rawData.split('\n');
    let comparisonTarget = contentLines[0].split(' ')[0];
    let itemsForCombination = contentLines[1].split(' ');

    let combinedSequence = "";
    let itemPointer = 0;
    while (itemPointer < itemsForCombination.length) {
        combinedSequence += itemsForCombination[itemPointer];
        itemPointer++;
    }

    let outcomeMessage = (combinedSequence > comparisonTarget) ? "Yes" : "No";
    console.log(outcomeMessage);
}

processIncomingData(require("fs").readFileSync("/dev/stdin", "utf8"));