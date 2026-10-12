class InputParser {
    constructor(inputString) {
        this.currentIndex = 0;
        this.originalInputString = inputString;
        this.tokenizedStrings = this._tokenizeInput(inputString);
    }

    _tokenizeInput(rawInput) {
        const cleanedInput = rawInput.replace(/[\n \t]+/g, " ");
        return cleanedInput.split(" ");
    }

    _fetchNextToken() {
        const token = this.tokenizedStrings[this.currentIndex];
        this.currentIndex++;
        return token !== undefined ? token : null;
    }

    getNextToken() {
        return this._fetchNextToken();
    }

    getNextInt() {
        const token = this._fetchNextToken();
        return token !== null ? parseInt(token) : null;
    }

    getNextFloat() {
        const token = this._fetchNextToken();
        return token !== null ? parseFloat(token) : null;
    }

    getNextByteArray() {
        const token = this._fetchNextToken();
        return token !== null ? new Int8Array(token) : null;
    }
}

function Solver(inputReader) {
    const numElements = inputReader.getNextInt();
    const maxValue = inputReader.getNextInt();
    const numQueries = inputReader.getNextInt();
    
    const queryConditions = [];
    for (let i = 0; i < numQueries; i++) {
        const condition = {
            a: inputReader.getNextInt(),
            b: inputReader.getNextInt(),
            c: inputReader.getNextInt(),
            d: inputReader.getNextInt(),
        };
        queryConditions.push(condition);
    }
    
    let currentCombination = Array(numElements).fill(1);
    let maxScore = 0;
    
    const checkAscending = (arr) => {
        for (let i = 0; i < numElements - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                return false;
            }
        }
        return true;
    };

    const calculateCombinationScore = (combinationArr, conditions) => {
        let score = 0;
        for (const cond of conditions) {
            if (cond.c === combinationArr[cond.b - 1] - combinationArr[cond.a - 1]) {
                score += cond.d;
            }
        }
        return score;
    };

    const totalCombinationsToGenerate = Math.pow(maxValue, numElements);

    for (let iterationCount = 0; iterationCount < totalCombinationsToGenerate; iterationCount++) {
        let carry = 1;
        for (let k = 0; k < numElements; k++) {
            if (carry === 0) break;
            currentCombination[k] += carry;
            if (currentCombination[k] > maxValue) {
                currentCombination[k] = 1;
                carry = 1;
            } else {
                carry = 0;
            }
        }
        
        if (!checkAscending(currentCombination)) {
            continue;
        }
        
        const currentScore = calculateCombinationScore(currentCombination, queryConditions);
        maxScore = Math.max(maxScore, currentScore);
    }
    
    console.log(maxScore);
}

Solver(new InputParser(require("fs").readFileSync("/dev/stdin", "utf8")));
