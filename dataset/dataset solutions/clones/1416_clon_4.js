function obtainInputLines() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    return fileContent.split(/\n\r?/);
}

function generateSequence(startNum, endNum) {
    return Array.from({ length: endNum - startNum + 1 }, (_, idx) => startNum + idx);
}

const remainingCards = ['S', 'H', 'C', 'D'].reduce((acc, currentSuit) => {
    acc[currentSuit] = new Set(generateSequence(1, 13));
    return acc;
}, {});

obtainInputLines().slice(1).forEach(function(inputLine) {
    const cardDetails = inputLine.split(' ');
    const suitIdentifier = cardDetails[0];
    const rankValue = Number(cardDetails[1]);

    remainingCards[suitIdentifier].delete(rankValue);
});
