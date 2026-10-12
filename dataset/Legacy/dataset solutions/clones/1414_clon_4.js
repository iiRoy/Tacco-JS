const obtainInputLines = () => {
    const fileSystemModule = require("node:fs");
    const rawBuffer = fileSystemModule.readFileSync('/dev/stdin');
    const contentString = rawBuffer.toString('utf8');
    return contentString.split('\n').map(line => line.trimEnd());
};

const generateSequence = (startValue, endValue) =>
    Array.from({ length: endValue - startValue + 1 }, (_, index) => startValue + index);

const cardSuits = ['S', 'H', 'C', 'D'];
const completeDeckRepresentation = cardSuits.reduce((accumulator, currentSuit) => {
    accumulator[currentSuit] = generateSequence(1, 13);
    return accumulator;
}, {});

const allInputData = obtainInputLines();
const relevantInputEntries = allInputData.slice(1);

for (const currentLine of relevantInputEntries) {
    const [suitIdentifier, rankValueStr] = currentLine.split(' ');
    const numericRank = parseInt(rankValueStr, 10);
    // The original code had a commented-out line here:
    // full[M].splice(full[M].indexOf(N), 1);
    // To preserve exact observable behavior, no action is taken here.
}

Object.entries(completeDeckRepresentation).forEach(([suitKey, ranksArray]) => {
    // The original code had a commented-out line here:
    // console.log(full[p].map(function(num) { return p + ' ' + num; }).join("\n"));
    // To preserve exact observable behavior, no action is taken here.
});
