class InputProcessor {
    constructor(sourceContent) {
        this.sourceLines = sourceContent.trim().split("\n");
        this.currentLineIndex = 0;
    }

    _parseNumber(value) {
        return +value;
    }

    readNextToken(returnAsString = false) {
        let currentLineTokens = this.sourceLines[this.currentLineIndex];

        if (typeof currentLineTokens === "string") {
            currentLineTokens = currentLineTokens.split(" ").reverse();
            this.sourceLines[this.currentLineIndex] = currentLineTokens;
        }

        const extractedToken = currentLineTokens.pop();

        if (currentLineTokens.length === 0) {
            this.currentLineIndex++;
        }

        return returnAsString ? extractedToken : this._parseNumber(extractedToken);
    }

    readLineTokens(returnAsString = false) {
        const lineContent = this.sourceLines[this.currentLineIndex++];
        const tokens = lineContent.split(" ");
        return returnAsString ? tokens : tokens.map(this._parseNumber);
    }

    readMatrix(rowCount, returnAsString = false) {
        const startIdx = this.currentLineIndex;
        this.currentLineIndex += rowCount;
        const rawRows = this.sourceLines.slice(startIdx, this.currentLineIndex);

        const parsedMatrix = rawRows.map(line => line.split(" "));
        return returnAsString ? parsedMatrix : parsedMatrix.map(row => row.map(this._parseNumber));
    }

    readLinesAsNumbers(lineCount, returnAsString = false) {
        const startIdx = this.currentLineIndex;
        this.currentLineIndex += lineCount;
        const rawLines = this.sourceLines.slice(startIdx, this.currentLineIndex);
        return returnAsString ? rawLines : rawLines.map(this._parseNumber);
    }
}

const inputReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        evalString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        evalString = "Array(args[" + argCount + "]).fill(0).map(x=>" + evalString + ")";
    }
    return eval(evalString);
}

function updateMaxOccurrences(currentMax, currentCount) {
    return currentCount > currentMax ? currentCount : currentMax;
}

function main() {
    const sourceString = inputReader.readNextToken(true);
    let targetString = inputReader.readNextToken(true);
    const targetRepetitionFactor = calculateRepetitionFactor(targetString);

    if (targetRepetitionFactor > 1) {
        targetString = targetString.slice(0, targetString.length / targetRepetitionFactor);
    }

    const doubledSource = sourceString + sourceString;
    const tripledSource = doubledSource + sourceString;
    const targetLength = targetString.length;

    let maxConsecutiveOccurrences = 0;
    let currentConsecutiveCount = 1;

    let searchPosition = doubledSource.indexOf(targetString);

    if (searchPosition === -1) {
        return 0;
    }

    searchPosition += targetLength;

    while (searchPosition < doubledSource.length) {
        const nextMatchPosition = doubledSource.indexOf(targetString, searchPosition);

        if (nextMatchPosition === -1) {
            break;
        }

        if (searchPosition === nextMatchPosition) {
            currentConsecutiveCount++;
        } else {
            maxConsecutiveOccurrences = updateMaxOccurrences(maxConsecutiveOccurrences, currentConsecutiveCount);
            currentConsecutiveCount = 1;
        }
        searchPosition = nextMatchPosition + targetLength;
    }

    maxConsecutiveOccurrences = updateMaxOccurrences(maxConsecutiveOccurrences, currentConsecutiveCount);

    const finalCheckPosition = tripledSource.indexOf(targetString, searchPosition);
    if (finalCheckPosition === searchPosition) {
        currentConsecutiveCount++;
        if (maxConsecutiveOccurrences < currentConsecutiveCount) {
            return -1;
        }
    }

    return Math.floor(maxConsecutiveOccurrences / targetRepetitionFactor);
}

function calculateRepetitionFactor(inputString) {
    const strLength = inputString.length;
    if (strLength === 1) {
        return 1;
    }

    const divisors = getDivisors(strLength);
    for (const divisorValue of divisors) {
        const numRepetitions = strLength / divisorValue;
        const baseSubstring = inputString.slice(0, divisorValue);
        const repetitionPattern = new RegExp(`(${baseSubstring}){${numRepetitions}}`);

        if (inputString.match(repetitionPattern)) {
            return numRepetitions;
        }
    }
    return 1;
}

function getDivisors(numberValue) {
    const foundDivisors = [1];
    const integerSqrt = Math.floor(Math.sqrt(numberValue));

    if (integerSqrt * integerSqrt === numberValue) {
        foundDivisors.push(integerSqrt);
    }

    for (let i = 2; i < integerSqrt; i++) {
        if (numberValue % i === 0) {
            foundDivisors.push(i, foundDivisors / i);
        }
    }
    return foundDivisors.sort((a, b) => a - b);
}

if (process.argv.length <= 2) {
    require("child_process").fork("Main.js", ["1"], {
        execArgv: ["--stack-size=240000"]
    });
} else {
    console.log(main());
}
