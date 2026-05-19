class InputHandler {
    constructor(rawInputContent) {
        this.lineGenerator = this._createLineIterator(rawInputContent);
        this.currentLineTokenBuffer = [];
    }

    *_createLineIterator(inputString) {
        const lines = inputString.trim().split("\n");
        for (const line of lines) {
            yield line;
        }
    }

    _refillTokenBuffer() {
        if (this.currentLineTokenBuffer.length === 0) {
            const { value: nextLine, done } = this.lineGenerator.next();
            if (done) {
                throw new Error("Input exhausted unexpectedly.");
            }
            this.currentLineTokenBuffer = nextLine.split(" ");
        }
    }

    fetchSingle(returnAsString) {
        this._refillTokenBuffer();
        const token = this.currentLineTokenBuffer.shift();
        return returnAsString ? token : Number(token);
    }

    fetchLine(returnAsString) {
        const { value: lineContent, done } = this.lineGenerator.next();
        if (done) throw new Error("Input exhausted unexpectedly.");
        const tokens = lineContent.split(" ");
        return returnAsString ? tokens : tokens.map(Number);
    }

    fetchMatrix(rowCount, returnAsString) {
        const matrixData = [];
        for (let i = 0; i < rowCount; i++) {
            matrixData.push(this.fetchLine(returnAsString));
        }
        return matrixData;
    }

    fetchRows(rowCount, returnAsString) {
        const rowData = [];
        for (let i = 0; i < rowCount; i++) {
            const { value: lineContent, done } = this.lineGenerator.next();
            if (done) throw new Error("Input exhausted unexpectedly.");
            rowData.push(returnAsString ? lineContent : Number(lineContent));
        }
        return rowData;
    }
}

function calculateExpectedOutcome() {
    const dataReader = new InputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalEvents = dataReader.fetchSingle();
    const eventProbabilities = dataReader.fetchLine();

    const probCache = Array.from({ length: totalEvents + 1 }, () =>
        Array.from({ length: totalEvents + 1 }, () => null)
    );

    function determineProbability(currentEventIndex, desiredSuccesses) {
        if (desiredSuccesses < 0 || desiredSuccesses > currentEventIndex) {
            return 0;
        }
        if (currentEventIndex === 0) {
            return desiredSuccesses === 0 ? 1 : 0;
        }

        if (probCache[currentEventIndex][desiredSuccesses] !== null) {
            return probCache[currentEventIndex][desiredSuccesses];
        }

        const currentEventSuccessProb = eventProbabilities[currentEventIndex - 1];
        const currentEventFailureProb = 1 - currentEventSuccessProb;

        const probIfCurrentSucceeds = determineProbability(currentEventIndex - 1, desiredSuccesses - 1) * currentEventSuccessProb;
        const probIfCurrentFails = determineProbability(currentEventIndex - 1, desiredSuccesses) * currentEventFailureProb;

        probCache[currentEventIndex][desiredSuccesses] = probIfCurrentSucceeds + probIfCurrentFails;
        return probCache[currentEventIndex][desiredSuccesses];
    }

    let totalDesiredProbability = 0;
    const minimumSuccesses = Math.floor((totalEvents + 1) / 2);

    for (let k = minimumSuccesses; k <= totalEvents; k++) {
        totalDesiredProbability += determineProbability(totalEvents, k);
    }

    return totalDesiredProbability;
}

console.log(calculateExpectedOutcome());
