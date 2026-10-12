const createInputParser = (function() {
    class InputSourceParser {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        readNextToken(returnAsStringFlag) {
            const currentLines = this.sourceLines;
            const linePosition = this.currentLineIndex;
            let extractedToken;

            if (typeof currentLines[linePosition] === "string") {
                currentLines[linePosition] = currentLines[linePosition].split(" ").reverse();
            }

            extractedToken = currentLines[linePosition].pop();

            if (currentLines[linePosition].length === 0) {
                this.currentLineIndex++;
            }

            return returnAsStringFlag ? extractedToken : +extractedToken;
        }

        readLineTokens(returnAsStringFlag) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const tokens = lineContent.split(" ");
            return returnAsStringFlag ? tokens : tokens.map(token => +token);
        }

        readMultiLineTokens(numLines, returnAsStringFlag) {
            const startIdx = this.currentLineIndex;
            this.currentLineIndex += numLines;
            const linesToProcess = this.sourceLines.slice(startIdx, this.currentLineIndex);

            const processedTokens = linesToProcess.map(line => line.split(" "));
            return returnAsStringFlag ? processedTokens : processedTokens.map(line => line.map(token => +token));
        }

        readRawLines(numLines, returnAsStringFlag) {
            const startIdx = this.currentLineIndex;
            this.currentLineIndex += numLines;
            const rawLines = this.sourceLines.slice(startIdx, this.currentLineIndex);
            return returnAsStringFlag ? rawLines : rawLines.map(line => +line);
        }
    }

    return function(sourceString) {
        return new InputSourceParser(sourceString);
    };
})();

const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let dimCount = args.length - 1;
    let arrayConstructionString;

    arrayConstructionString = `Array(args[${dimCount}]).fill(0).map(() => { return initialValue; })`;

    while (--dimCount >= 1) {
        arrayConstructionString = `Array(args[${dimCount}]).fill(0).map(() => ${arrayConstructionString})`;
    }

    const dynamicArrayCreator = new Function('initialValue', 'args', `return ${arrayConstructionString};`);
    return dynamicArrayCreator(initialValue, args);
}

console.log(processMainLogic());

function processMainLogic() {
    const numElements = inputReader.readNextToken();
    const inputNumbers = inputReader.readLineTokens();

    inputNumbers.sort((valA, valB) => valA - valB);

    const operationSteps = [];
    let initialSumResult;

    const firstElementValue = inputNumbers[0];
    initialSumResult = -firstElementValue;

    for (let sumIdx = 1; sumIdx < numElements; sumIdx++) {
        initialSumResult += Math.abs(inputNumbers[sumIdx]);
    }
    operationSteps.push(initialSumResult);

    let currentOperationAccumulator = inputNumbers[0];
    const lastElementIdx = numElements - 1;
    let isFirstOperationAdded = false;

    for (let opIdx = 1; opIdx < lastElementIdx; opIdx++) {
        const currentElementForOp = inputNumbers[opIdx];

        if (currentElementForOp < 0) {
            continue;
        }

        let firstOperandForCurrentStep;
        if (!isFirstOperationAdded) {
            firstOperandForCurrentStep = inputNumbers[0];
            currentOperationAccumulator = inputNumbers[0] - currentElementForOp;
            isFirstOperationAdded = true;
        } else {
            firstOperandForCurrentStep = currentOperationAccumulator;
            currentOperationAccumulator -= currentElementForOp;
        }
        operationSteps.push(`${firstOperandForCurrentStep} ${currentElementForOp}`);
    }

    const finalElementValue = inputNumbers[lastElementIdx];
    operationSteps.push(`${finalElementValue} ${currentOperationAccumulator}`);
    currentOperationAccumulator = finalElementValue - currentOperationAccumulator;

    let secondOperandSourceIndex = 1;
    while (operationSteps.length < numElements) {
        const operandFromInput = inputNumbers[secondOperandSourceIndex];
        operationSteps.push(`${currentOperationAccumulator} ${operandFromInput}`);
        currentOperationAccumulator -= operandFromInput;
        secondOperandSourceIndex++;
    }

    return operationSteps.join("\n");
}
