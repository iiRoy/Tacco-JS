class InputHandler {
    constructor(rawInputString) {
        this.lineSource = rawInputString.trim().split("\n");
        this.currentLineIndex = 0;
        this.currentLineTokens = [];
    }

    fetchNextValue(returnAsString) {
        if (this.currentLineTokens.length === 0) {
            if (this.currentLineIndex >= this.lineSource.length) {
                throw new Error("Input exhausted.");
            }
            this.currentLineTokens = this.lineSource[this.currentLineIndex].split(" ").reverse();
        }

        const value = this.currentLineTokens.pop();

        if (this.currentLineTokens.length === 0) {
            this.currentLineIndex++;
        }

        return returnAsString ? value : +value;
    }

    fetchLineValues(returnAsString) {
        this.currentLineTokens = [];
        if (this.currentLineIndex >= this.lineSource.length) {
            throw new Error("Input exhausted.");
        }
        const line = this.lineSource[this.currentLineIndex++];
        const tokens = line.split(" ");
        return returnAsString ? tokens : tokens.map(Number);
    }

    fetchMatrix(count, returnAsString) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(this.fetchLineValues(returnAsString));
        }
        return result;
    }

    fetchVector(count, returnAsString) {
        const result = [];
        this.currentLineTokens = [];
        for (let i = 0; i < count; i++) {
            if (this.currentLineIndex >= this.lineSource.length) {
                throw new Error("Input exhausted.");
            }
            const line = this.lineSource[this.currentLineIndex++];
            result.push(returnAsString ? line : +line);
        }
        return result;
    }
}

const createInputParser = (rawInput) => new InputHandler(rawInput);

const inputSource = createInputParser(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(processQueries());

function processQueries(){
    const MAX_VAL = 100000;
    const primeFlags = new Uint8Array(MAX_VAL + 1).fill(1);
    primeFlags[0] = 0;
    primeFlags[1] = 0;

    for (let currentNum = 2; currentNum * currentNum <= MAX_VAL; currentNum++) {
        if (primeFlags[currentNum]) {
            for (let multiple = currentNum * currentNum; multiple <= MAX_VAL; multiple += currentNum) {
                primeFlags[multiple] = 0;
            }
        }
    }

    const cumulativeCounts = new Uint32Array(MAX_VAL + 1);
    cumulativeCounts[0] = 0;
    cumulativeCounts[1] = 0;

    for (let num = 2; num <= MAX_VAL; num++) {
        cumulativeCounts[num] = cumulativeCounts[num - 1];
        if (primeFlags[num]) {
            const halfPlusOne = (num + 1) / 2;
            if (Number.isInteger(halfPlusOne) && primeFlags[halfPlusOne]) {
                cumulativeCounts[num]++;
            }
        }
    }

    const queryCount = inputSource.fetchNextValue();
    const results = Array.from({ length: queryCount }, () => {
        const [lowerBound, upperBound] = inputSource.fetchLineValues();
        return cumulativeCounts[upperBound] - cumulativeCounts[lowerBound - 1];
    });

    return results.join("\n");
}
