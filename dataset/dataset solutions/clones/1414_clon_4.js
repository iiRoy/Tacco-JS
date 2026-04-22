const fileSystemInterface = require("fs");

const acquireExternalData = (pathSpecifier = "/dev/stdin") => {
    try {
        return fileSystemInterface.readFileSync(pathSpecifier, "utf8").split(/\r?\n/);
    } catch (e) {
        return [];
    }
};

const produceCompleteDeck = () =>
    ['S', 'H', 'C', 'D']
        .flatMap(suitSymbol =>
            Array.from({ length: 13 }, (_, rankIndex) => rankIndex + 1)
                .map(rankValue => `${suitSymbol} ${rankValue}`)
        )
        .reduce((accumulatorSet, pieceString) => accumulatorSet.add(pieceString), new Set());

const customPieceSorter = (pieceOne, pieceTwo) => {
    const symbolOrderMap = { 'S': 0, 'H': 1, 'C': 2, 'D': 3 };
    const [symbolOne, valueOneStr] = pieceOne.split(' ');
    const [symbolTwo, valueTwoStr] = pieceTwo.split(' ');

    const orderDifference = symbolOrderMap[symbolOne] - symbolOrderMap[symbolTwo];
    if (orderDifference !== 0) {
        return orderDifference;
    }
    return parseInt(valueOneStr) - parseInt(valueTwoStr);
};

(() => {
    let currentPieceCollection = produceCompleteDeck();
    const externalInputLines = acquireExternalData();

    if (externalInputLines.length > 1) {
        externalInputLines.slice(1).forEach(inputEntry => {
            const entryParts = inputEntry.split(' ');
            if (entryParts.length === 2) {
                const pieceSymbol = entryParts[0];
                const pieceValue = parseInt(entryParts[1]);
                const pieceIdentifier = `${pieceSymbol} ${pieceValue}`;
                currentPieceCollection.delete(pieceIdentifier);
            }
        });
    }

    const finalDisplayStrings = Array.from(currentPieceCollection).sort(customPieceSorter);

    console.log(finalDisplayStrings.join('\n'));
})();