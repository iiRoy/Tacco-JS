"use strict";

const parseNumericValue = (val) => {
    const num = Number(val);
    if (isNaN(num)) {
        return 0;
    }
    return num;
};

const InputStreamProcessorFactory = (function() {
    class LineBasedInputSource {
        constructor(rawInput) {
            if (typeof rawInput !== 'string' || rawInput.trim() === '') {
                this.sourceLines = ["0"];
                this.currentLinePointer = 0;
            } else {
                this.sourceLines = rawInput.trim().split("\n");
                this.currentLinePointer = 0;
            }
        }

        readToken(returnAsString = false) {
            if (this.currentLinePointer >= this.sourceLines.length) {
                return returnAsString ? "" : 0;
            }

            let currentLineData = this.sourceLines[this.currentLinePointer];
            if (typeof currentLineData === "string") {
                this.sourceLines[this.currentLinePointer] = currentLineData.split(" ").reverse();
            }

            let tokensOnLine = this.sourceLines[this.currentLinePointer];
            let extractedToken = tokensOnLine.pop();

            if (tokensOnLine.length === 0) {
                this.currentLinePointer++;
            }

            return returnAsString ? extractedToken : parseNumericValue(extractedToken);
        }

        readLineAsTokens(returnAsStringArray = false) {
            if (this.currentLinePointer >= this.sourceLines.length) {
                return [];
            }

            const lineContent = this.sourceLines[this.currentLinePointer++];
            const splitTokens = lineContent.split(" ");

            return returnAsStringArray ? splitTokens : splitTokens.map(parseNumericValue);
        }

        readBlockAsMatrix(count, returnStringMatrix = false) {
            if (count <= 0 || this.currentLinePointer >= this.sourceLines.length) {
                return [];
            }
            
            let actualCount = Math.min(count, this.sourceLines.length - this.currentLinePointer);

            const linesToProcess = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer + actualCount);
            this.currentLinePointer += actualCount;

            const processedMatrix = linesToProcess.map(line => line.split(" "));

            return returnStringMatrix ? processedMatrix : processedMatrix.map(row => row.map(parseNumericValue));
        }

        readLinesBlock(count, returnRawLines = false) {
            if (count <= 0 || this.currentLinePointer >= this.sourceLines.length) {
                return [];
            }

            let actualCount = Math.min(count, this.sourceLines.length - this.currentLinePointer);
            
            const linesExtracted = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer + actualCount);
            this.currentLinePointer += actualCount;

            return returnRawLines ? linesExtracted : linesExtracted.map(parseNumericValue);
        }
    }

    return (inputString) => new LineBasedInputSource(inputString);
})();

const readStandardInput = () => {
    try {
        const fs = require("fs");
        return fs.readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        return "";
    }
};

const dataInputProcessor = InputStreamProcessorFactory(readStandardInput());

function processInputData() {
    const totalItems = dataInputProcessor.readToken();
    if (totalItems <= 0) {
        return 0;
    }

    const decayWindow = dataInputProcessor.readToken();
    if (decayWindow < 0) {
        return 0;
    }

    const impactFactor = dataInputProcessor.readToken();
    if (impactFactor <= 0) {
        return 0;
    }

    const sortedEventData = dataInputProcessor.readBlockAsMatrix(totalItems)
                                         .sort((eventA, eventB) => eventA[0] - eventB[0]);

    let cumulativeResult = 0;
    const activeEventsQueue = [];
    let queueReadPointer = 0;
    let currentActiveEffectSum = 0;

    for (let currentEventIndex = 0; currentEventIndex < totalItems; currentEventIndex++) {
        const [eventTimestamp, eventInitialValue] = sortedEventData[currentEventIndex];

        while (queueReadPointer < activeEventsQueue.length) {
            const [eventExpirationTime, eventContribution] = activeEventsQueue[queueReadPointer];
            if (eventExpirationTime < eventTimestamp - decayWindow) {
                currentActiveEffectSum -= eventContribution * impactFactor;
                queueReadPointer++;
            } else {
                break;
            }
        }

        let requiredAmount = eventInitialValue - currentActiveEffectSum;

        if (requiredAmount <= 0) {
            continue;
        }

        const unitsNeeded = Math.ceil(requiredAmount / impactFactor);
        
        activeEventsQueue.push([eventTimestamp + decayWindow, unitsNeeded]);
        
        cumulativeResult += unitsNeeded;
        currentActiveEffectSum += unitsNeeded * impactFactor;
    }

    return cumulativeResult;
}

const programOutput = processInputData();
if (programOutput !== undefined) {
    console.log(programOutput);
}