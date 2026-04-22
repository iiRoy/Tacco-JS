var lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

class DataFetcher {
    constructor(dataLines) {
        this.allEntries = dataLines;
        this.currentEntryIndex = 0;
        this.totalEntries = dataLines.length;
    }

    verifyAvailability() {
        return this.currentEntryIndex < this.totalEntries;
    }

    retrieveNext() {
        if (!this.verifyAvailability()) {
            throw new Error("Data Source Exhausted: No further entries available.");
        }
        const retrievedEntry = this.allEntries[this.currentEntryIndex];
        this.currentEntryIndex++;
        return retrievedEntry;
    }
}

let globalDataStore;
let collectedRawLines = [];

lineProcessor.on('line', (dataUnit) => { collectedRawLines.push(dataUnit); });
lineProcessor.on('close', () => {
    globalDataStore = new DataFetcher(collectedRawLines);
    diagnosticLog("---execution-start---");
    const initialTimestamp = Date.now();
    executePrimaryRoutine();
    const finalDuration = Date.now() - initialTimestamp;
    diagnosticLog("---execution-end---");
    diagnosticLog(`elapsed : ${finalDuration}ms`);
});

const valueFormatter = {
    asInteger: (str) => parseInt(str, 10),
    asStringArray: (str) => str.split(" "),
    asNumericArray: (str) => str.split(" ").map(Number),
    asCharList: (str) => str.split(""),
    asNumericCharList: (str) => str.split("").map(Number),
    joinBySpace: (arr) => arr.join(" "),
    joinByNewline: (arr) => arr.join("\n"),
    joinWithoutDelimiter: (arr) => arr.join(""),
    raw: (val) => val
};

function processEntryConversion(item, conversionScheme) {
    try {
        switch (conversionScheme) {
            case 1: return valueFormatter.asInteger(item);
            case 2: return valueFormatter.asStringArray(item);
            case 4: return valueFormatter.asNumericArray(item);
            case 6: return valueFormatter.asCharList(item);
            case 7: return valueFormatter.asNumericCharList(item);
            case 8: return valueFormatter.joinBySpace(item);
            case 9: return valueFormatter.joinByNewline(item);
            case 0: return valueFormatter.joinWithoutDelimiter(item);
            default: return valueFormatter.raw(item);
        }
    } catch (e) {
        return item;
    }
}

function retrieveNextInteger() { return processEntryConversion(fetchNextEntry(), 1); }
function retrieveNextStringArray() { return processEntryConversion(fetchNextEntry(), 2); }
function retrieveNextIntegerArray() { return processEntryConversion(fetchNextEntry(), 4); }
function retrieveNextCharacterArray() { return processEntryConversion(fetchNextEntry(), 6); }
function fetchNextEntry() { return globalDataStore.retrieveNext(); }
function hasMoreEntries() { return globalDataStore.verifyAvailability(); }

function displayOutput(content) { console.log(content); }
function diagnosticLog(message) { console.warn(`diag: ${JSON.stringify(message)}`); }

function executePrimaryRoutine() {
    const collectionSize = retrieveNextInteger();
    let numberSet = Array.from({ length: collectionSize }, () => retrieveNextInteger());
    let cumulativeDifference = 0;
    let sequenceFormation = [];

    numberSet.sort((valX, valY) => valX - valY);
    
    sequenceFormation.push(numberSet.shift());

    while (numberSet.length > 0) {
        const sequenceFront = sequenceFormation[0];
        const sequenceBack = sequenceFormation[sequenceFormation.length - 1];
        const setSmallest = numberSet[0];
        const setLargest = numberSet[numberSet.length - 1];

        if (sequenceFront === sequenceBack && setSmallest === setLargest) {
            sequenceFormation.push(numberSet.pop());
        } else if (sequenceFront === sequenceBack) {
            if (Math.abs(sequenceFront - setSmallest) >= Math.abs(sequenceFront - setLargest)) {
                sequenceFormation.push(numberSet.shift());
            } else {
                sequenceFormation.push(numberSet.pop());
            }
        } else if (setSmallest === setLargest) {
            if (Math.abs(sequenceFront - setSmallest) >= Math.abs(sequenceBack - setSmallest)) {
                sequenceFormation.unshift(numberSet.shift());
            } else {
                sequenceFormation.push(numberSet.shift());
            }
        } else {
            const decisionOptions = [
                {
                    diffValue: Math.abs(setSmallest - sequenceFront),
                    actionPerformer: () => sequenceFormation.unshift(numberSet.pop())
                },
                {
                    diffValue: Math.abs(setSmallest - sequenceBack),
                    actionPerformer: () => sequenceFormation.push(numberSet.shift())
                },
                {
                    diffValue: Math.abs(setLargest - sequenceFront),
                    actionPerformer: () => sequenceFormation.unshift(numberSet.pop())
                },
                {
                    diffValue: Math.abs(setLargest - sequenceBack),
                    actionPerformer: () => sequenceFormation.push(numberSet.pop())
                }
            ];

            let maximumDiff = -1;
            let selectedAction = null;

            for (const option of decisionOptions) {
                if (option.diffValue > maximumDiff) {
                    maximumDiff = option.diffValue;
                    selectedAction = option;
                }
            }
            selectedAction.actionPerformer();
        }
    }
    
    for (let k = 1; k < collectionSize; k++) {
        cumulativeDifference += Math.abs(sequenceFormation[k - 1] - sequenceFormation[k]);
    }
    displayOutput(cumulativeDifference);
}