class InputReader {
    constructor(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    readNextValue(returnAsString = false) {
        let lineTokens = this.sourceLines[this.currentLineIndex];
        
        if (typeof lineTokens === "string") {
            this.sourceLines[this.currentLineIndex] = lineTokens.split(" ").reverse();
            lineTokens = this.sourceLines[this.currentLineIndex];
        }

        const extractedToken = lineTokens.pop();
        
        if (!lineTokens.length) {
            this.currentLineIndex++;
        }
        
        return returnAsString ? extractedToken : Number(extractedToken);
    }

    readLineValues(returnAsString = false) {
        const lineContent = this.sourceLines[this.currentLineIndex++];
        const tokens = lineContent.split(" ");
        return returnAsString ? tokens : tokens.map(Number);
    }

    readMatrix(rowCount, returnAsString = false) {
        const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + rowCount);
        this.currentLineIndex += rowCount;
        const processedMatrix = matrixRows.map(row => {
            const rowTokens = row.split(" ");
            return returnAsString ? rowTokens : rowTokens.map(Number);
        });
        return processedMatrix;
    }

    readRawLines(count, returnAsString = false) {
        const rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + count);
        this.currentLineIndex += count;
        return returnAsString ? rawLines : rawLines.map(Number);
    }
}

const createInputReader = (source) => new InputReader(source);

const MODULUS_VALUE = 1e9 + 7;

const performModularAddition = (valueA, valueB, modulus) => (valueA + valueB) % modulus;

const inputProcessor = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function solveProblem() {
    const totalElementsCount = inputProcessor.readNextValue();
    const colorSequenceData = inputProcessor.readRawLines(totalElementsCount);

    const maxColorValueCapacity = 200000;
    const colorOccurrencesMap = Array.from({ length: maxColorValueCapacity }, () => []);

    for (let currentElementIndex = 0; currentElementIndex < totalElementsCount; currentElementIndex++) {
        const currentColorValue = colorSequenceData[currentElementIndex];
        colorOccurrencesMap[currentColorValue - 1].push(currentElementIndex);
    }

    for (let colorMapIndex = 0; colorMapIndex < totalElementsCount; colorMapIndex++) {
        const currentOccurrencesList = colorOccurrencesMap[colorMapIndex];
        if (currentOccurrencesList.length > 0) {
            currentOccurrencesList.reverse();
            currentOccurrencesList.pop();
        }
    }

    const dynamicProgrammingTable = Array(totalElementsCount).fill(0);
    dynamicProgrammingTable[0] = 1;

    const firstColorNextIndex = colorOccurrencesMap[colorSequenceData[0] - 1].pop();
    if (firstColorNextIndex !== undefined && firstColorNextIndex > 1) {
        dynamicProgrammingTable[firstColorNextIndex] = 1;
    }

    for (let currentIterationIndex = 1; currentIterationIndex < totalElementsCount; currentIterationIndex++) {
        dynamicProgrammingTable[currentIterationIndex] = performModularAddition(
            dynamicProgrammingTable[currentIterationIndex],
            dynamicProgrammingTable[currentIterationIndex - 1],
            MODULUS_VALUE
        );

        const currentSequenceColor = colorSequenceData[currentIterationIndex];
        const nextValidJumpIndex = colorOccurrencesMap[currentSequenceColor - 1].pop();

        if (nextValidJumpIndex !== undefined && nextValidJumpIndex > currentIterationIndex + 1) {
            dynamicProgrammingTable[nextValidJumpIndex] = dynamicProgrammingTable[currentIterationIndex];
        }
    }

    return dynamicProgrammingTable[totalElementsCount - 1];
}

console.log(solveProblem());
