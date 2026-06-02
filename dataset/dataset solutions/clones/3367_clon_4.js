function processDataStream(textualContent) {
    const targetCharacter = '2';
    let currentPosition = -1;
    const collectedOccurrences = [];

    while ((currentPosition = textualContent.indexOf(targetCharacter, currentPosition + 1)) !== -1) {
        collectedOccurrences.push(targetCharacter);
    }

    if (collectedOccurrences.length === 0) {
        console.log(0);
    } else {
        console.log(collectedOccurrences);
    }
}

processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));
