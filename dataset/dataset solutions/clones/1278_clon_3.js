var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var existingCardList = rawInputData.split("\n");
existingCardList.shift();

var cardSuitIdentifiers = "SHCD".split("");
var missingCardLines = [];

function constructCardString(suitSymbol, rankNumber) {
    return suitSymbol + " " + rankNumber;
}

for (var suitIdx = 0; suitIdx < cardSuitIdentifiers.length; suitIdx++) {
    const currentSuitSymbol = cardSuitIdentifiers[suitIdx];

    for (var rankVal = 1; rankVal <= 13; rankVal++) {
        const generatedCardRepresentation = constructCardString(currentSuitSymbol, rankVal);

        const isCardPresentInInput = existingCardList.includes(generatedCardRepresentation);

        if (!isCardPresentInInput) {
            missingCardLines.push(generatedCardRepresentation);
        }
    }
}

if (missingCardLines.length > 0) {
    console.log(missingCardLines.join("\n"));
}
