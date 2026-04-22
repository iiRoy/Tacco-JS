class LineReader {
    constructor(sourcePath) {
        this.inputLines = require("node:fs").readFileSync(sourcePath, "utf8").trim().split("\n");
        this.linePointer = 0;
    }

    retrieveNextEntry() {
        if (!this.hasMoreEntries()) {
            throw new Error("SupplyExhausted: No more entries available.");
        }
        const currentLine = this.inputLines[this.linePointer];
        this.linePointer++;
        return currentLine;
    }

    hasMoreEntries() {
        return this.linePointer < this.inputLines.length;
    }
}

const convertToInteger = (strValue) => Number.parseInt(strValue, 10);
const splitStringBySpace = (strValue) => strValue.split(" ");
const splitStringBySpaceAndParse = (strValue) => strValue.split(" ").map(Number);
const splitStringByCharacter = (strValue) => strValue.split("");
const splitStringByCharacterAndParse = (strValue) => strValue.split("").map(Number);

const printResult = (messageContent) => console.log(messageContent);
const printError = (errorMessage) => console.error(errorMessage);

function performRecursiveTransformation(currentX, currentY, remainingCycles, initialCycles) {
    if (remainingCycles === 0) {
        return [currentX, currentY];
    }

    const currentCycleIndex = initialCycles - remainingCycles;

    let nextX = currentX;
    let nextY = currentY;

    if (currentCycleIndex % 2 === 0) {
        if (nextX % 2 === 1) {
            nextX--;
        }
        nextY += nextX / 2;
        nextX /= 2;
    } else {
        if (nextY % 2 === 1) {
            nextY--;
        }
        nextX += nextY / 2;
        nextY /= 2;
    }

    return performRecursiveTransformation(nextX, nextY, remainingCycles - 1, initialCycles);
}

function executeCoreLogic() {
    const dataStream = new LineReader("/dev/stdin");

    const initialParametersLine = dataStream.retrieveNextEntry();
    const [valX, valY, totalCycles] = splitStringBySpaceAndParse(initialParametersLine);

    const finalValues = performRecursiveTransformation(valX, valY, totalCycles, totalCycles);

    printResult(finalValues[0] + " " + finalValues[1]);
}

executeCoreLogic();