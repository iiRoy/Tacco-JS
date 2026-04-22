const obtainSourceContent = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();
const processRawLines = (contentBlock) => contentBlock.split("\n");

let processedInputLines = [];
let currentPosition = 0;

const prepareInputHandler = () => {
    processedInputLines = processRawLines(obtainSourceContent());
    currentPosition = 0;
};

const fetchNextEntry = () => {
    if (currentPosition >= processedInputLines.length) {
        return "";
    }
    return processedInputLines[currentPosition++];
};

const transformToNumericSequence = (textSegment) => textSegment.split(" ").map(Number);
const extractIndividualCharacters = (textSegment) => textSegment.split("");

const initiateProcess = () => {
    prepareInputHandler();

    const dimensionsData = transformToNumericSequence(fetchNextEntry());
    const gridHeight = dimensionsData[0];
    const gridWidth = dimensionsData[1];

    const symbolTallies = new Map();
    for (let rowIdx = 0; rowIdx < gridHeight; ++rowIdx) {
        const rowSymbols = extractIndividualCharacters(fetchNextEntry());
        rowSymbols.forEach(sym => {
            symbolTallies.set(sym, (symbolTallies.get(sym) || 0) + 1);
        });
    }

    const halfHeightRoundedUp = Math.ceil(gridHeight / 2);
    const halfWidthRoundedUp = Math.ceil(gridWidth / 2);

    let neededFourBlocks = 0;
    let neededTwoBlocks = 0;
    let neededSingleBlocks = 0;

    if (gridHeight % 2 === 1 && gridWidth % 2 === 1) {
        neededFourBlocks = (halfHeightRoundedUp - 1) * (halfWidthRoundedUp - 1);
        neededTwoBlocks = (halfHeightRoundedUp - 1) + (halfWidthRoundedUp - 1);
        neededSingleBlocks = 1;
    } else if (gridHeight % 2 === 1 && gridWidth % 2 === 0) {
        neededFourBlocks = halfWidthRoundedUp * (halfHeightRoundedUp - 1);
        neededTwoBlocks = halfWidthRoundedUp;
    } else if (gridHeight % 2 === 0 && gridWidth % 2 === 1) {
        neededFourBlocks = halfHeightRoundedUp * (halfWidthRoundedUp - 1);
        neededTwoBlocks = halfHeightRoundedUp;
    } else { // Both even
        neededFourBlocks = halfHeightRoundedUp * halfWidthRoundedUp;
    }

    const evaluatePossibility = (initialSymbolTallies, targetFours, targetTwos, targetSingles) => {
        let mutableSymbolTallies = new Map(initialSymbolTallies);
        let remainingFours = targetFours;
        let remainingTwos = targetTwos;
        let remainingSingles = targetSingles;

        for (const [symbol, tally] of mutableSymbolTallies.entries()) {
            const availableFours = Math.floor(tally / 4);
            const foursToConsume = Math.min(availableFours, remainingFours);
            remainingFours -= foursToConsume;
            mutableSymbolTallies.set(symbol, tally - (foursToConsume * 4));
            if (remainingFours === 0) break;
        }
        if (remainingFours > 0) return false;

        for (const [symbol, tally] of mutableSymbolTallies.entries()) {
            const availableTwos = Math.floor(tally / 2);
            const twosToConsume = Math.min(availableTwos, remainingTwos);
            remainingTwos -= twosToConsume;
            mutableSymbolTallies.set(symbol, tally - (twosToConsume * 2));
            if (remainingTwos === 0) break;
        }
        if (remainingTwos > 0) return false;

        for (const [symbol, tally] of mutableSymbolTallies.entries()) {
            const availableSingles = Math.floor(tally / 1);
            const singlesToConsume = Math.min(availableSingles, remainingSingles);
            remainingSingles -= singlesToConsume;
            mutableSymbolTallies.set(symbol, tally - (singlesToConsume * 1));
            if (remainingSingles === 0) break;
        }
        if (remainingSingles > 0) return false;

        return true;
    };

    if (evaluatePossibility(symbolTallies, neededFourBlocks, neededTwoBlocks, neededSingleBlocks)) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

initiateProcess();