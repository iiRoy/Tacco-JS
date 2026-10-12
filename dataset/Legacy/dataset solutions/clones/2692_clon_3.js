const InputReaderFactory = (() => {
    class InputReader {
        constructor(sourceText) {
            this._sourceLines = sourceText.trim().split("\n");
            this._currentLineIndex = 0;
        }

        readAtom(asStringFlag) {
            let currentLineContent = this._sourceLines[this._currentLineIndex];
            if (typeof currentLineContent === "string") {
                this._sourceLines[this._currentLineIndex] = currentLineContent.split(" ").reverse();
                currentLineContent = this._sourceLines[this._currentLineIndex];
            }

            const extractedToken = currentLineContent.pop();

            if (!currentLineContent.length) {
                this._currentLineIndex++;
            }
            return asStringFlag ? extractedToken : +extractedToken;
        }

        readLine(asStringFlag) {
            const lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
            return asStringFlag ? lineTokens : lineTokens.map(token => +token);
        }

        readMatrix(numRows, asStringFlag) {
            const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows)
                                                .map(line => line.split(" "));
            this._currentLineIndex += numRows;
            return asStringFlag ? matrixRows : matrixRows.map(row => row.map(token => +token));
        }

        readRows(numRows, asStringFlag) {
            const rawRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
            this._currentLineIndex += numRows;
            return asStringFlag ? rawRows : rawRows.map(token => +token);
        }
    }

    return (source) => new InputReader(source);
})();

const inputDataProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let lengthIndex = args.length;
    let arrayCreationString = `Array(args[${--lengthIndex}]).fill(0).map(x => { return ${initialValue}; })`;

    while (--lengthIndex > 0) {
        arrayCreationString = `Array(args[${lengthIndex}]).fill(0).map(x => ${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

console.log(solveProblem());

function solveProblem() {
    const arraySize = inputDataProcessor.readAtom();
    const maxCost = inputDataProcessor.readAtom();
    const inputArray = inputDataProcessor.readLine();

    let arraySum = 0;
    for (const val of inputArray) {
        arraySum += val;
    }

    const divisorsOfSum = findDivisors(arraySum);

    for (const currentDivisor of divisorsOfSum) {
        const remainderArray = inputArray.map(element => element % currentDivisor).sort((valA, valB) => valA - valB);

        let rightPointer = arraySize;
        let currentWindowSum = 0;
        let currentMaxCost = 0;

        for (let leftPointer = 0; leftPointer < rightPointer && currentMaxCost <= maxCost; ++leftPointer) {
            currentWindowSum += remainderArray[leftPointer];
            currentMaxCost += remainderArray[leftPointer];

            while (currentWindowSum > 0 && leftPointer < rightPointer) {
                rightPointer--;
                currentWindowSum -= (currentDivisor - remainderArray[rightPointer]);
            }
        }

        if (currentMaxCost <= maxCost) {
            return currentDivisor;
        }
    }
    return 1;
}

function findDivisors(targetNumber) {
    const divisorList = [targetNumber];
    const sqrtTarget = Math.sqrt(targetNumber);
    const intSqrt = Math.floor(sqrtTarget);

    if (intSqrt * intSqrt === targetNumber) {
        divisorList.push(intSqrt);
    }

    for (let currentDivisorCandidate = 2; currentDivisorCandidate < sqrtTarget; ++currentDivisorCandidate) {
        if (targetNumber % currentDivisorCandidate === 0) {
            divisorList.push(currentDivisorCandidate, targetNumber / currentDivisorCandidate);
        }
    }
    return divisorList.sort((valA, valB) => valB - valA);
}
