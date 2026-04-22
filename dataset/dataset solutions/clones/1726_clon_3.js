class DataStreamProcessor {
    #inputLines;
    #currentLinePosition;
    #totalLinesAvailable;

    constructor(sourceFilePath = "/dev/stdin") {
        try {
            const rawContent = require("fs").readFileSync(sourceFilePath, "utf8");
            const processedContent = rawContent.trim();
            if (processedContent.length === 0) {
                this.#inputLines = [];
                console.warn("Warning: The provided input source was empty.");
            } else {
                this.#inputLines = processedContent.split("\n");
            }

            this.#currentLinePosition = 0;
            this.#totalLinesAvailable = this.#inputLines.length;

        } catch (readError) {
            console.error(`Error: Could not access input source "${sourceFilePath}". Details: ${readError.message}`);
            this.#inputLines = [];
            this.#currentLinePosition = 0;
            this.#totalLinesAvailable = 0;
        }
    }

    hasMoreDataLines() {
        return this.#currentLinePosition < this.#totalLinesAvailable;
    }

    retrieveNextLine() {
        if (!this.hasMoreDataLines()) {
            throw new Error("InputEndOfStream: Attempted to read beyond the end of the input.");
        }
        return this.#inputLines[this.#currentLinePosition++];
    }

    parseNextInteger() {
        const lineContent = this.retrieveNextLine();
        const numericValue = parseInt(lineContent, 10);

        if (isNaN(numericValue)) {
            console.error(`Error: Expected an integer but received "${lineContent}". Defaulting to 0.`);
            return 0;
        }
        return numericValue;
    }

    getLineAsTokens() {
        return this.retrieveNextLine().split(" ");
    }

    getNumericArrayFromLine() {
        return this.getLineAsTokens().map(token => {
            const num = parseInt(token, 10);
            if (isNaN(num)) {
                console.warn(`Warning: Non-numeric token "${token}" found; converting to 0.`);
                return 0;
            }
            return num;
        });
    }

    getCharacterArrayFromLine() {
        return this.retrieveNextLine().split("");
    }

    resetStreamPosition() {
        this.#currentLinePosition = 0;
        console.info("Input stream position has been reset.");
    }
}

const inputHandler = new DataStreamProcessor();

const fetchLine = () => inputHandler.retrieveNextLine();
const fetchInt = () => inputHandler.parseNextInteger();
const fetchIntArray = () => inputHandler.getNumericArrayFromLine();
const fetchStringTokens = () => inputHandler.getLineAsTokens();
const fetchCharList = () => inputHandler.getCharacterArrayFromLine();
const checkAvailability = () => inputHandler.hasMoreDataLines();

const outputResult = (...itemsToLog) => console.log(...itemsToLog);

const solveBookProblem = () => {
    const [libraryASize, libraryBSize, budgetTime] = fetchIntArray();

    const libraryATimes = fetchIntArray();
    const libraryBTimes = fetchIntArray();

    if (libraryATimes.length !== libraryASize) {
        console.warn(`Mismatch: Declared Library A size (${libraryASize}) vs. actual books read (${libraryATimes.length}). Proceeding with actual count.`);
    }
    if (libraryBTimes.length !== libraryBSize) {
        console.warn(`Mismatch: Declared Library B size (${libraryBSize}) vs. actual books read (${libraryBTimes.length}). Proceeding with actual count.`);
    }

    const cumulativeTimesA = [0];
    let currentTotalTimeA = 0;
    for (let bookIndex = 0; bookIndex < libraryATimes.length; bookIndex++) {
        currentTotalTimeA += libraryATimes[bookIndex];
        cumulativeTimesA.push(currentTotalTimeA);
    }

    const cumulativeTimesB = [0];
    let currentTotalTimeB = 0;
    libraryBTimes.forEach(timeCost => {
        currentTotalTimeB += timeCost;
        cumulativeTimesB.push(currentTotalTimeB);
    });

    let maxBooksPossible = 0;

    let pointerB = libraryBSize;

    for (let countFromA = 0; countFromA <= libraryASize; countFromA++) {
        const timeSpentA = cumulativeTimesA[countFromA];

        if (timeSpentA > budgetTime) {
            break;
        }

        while (pointerB >= 0 && (timeSpentA + cumulativeTimesB[pointerB] > budgetTime)) {
            pointerB--;
        }

        const currentCombinedBooks = countFromA + pointerB;
        maxBooksPossible = Math.max(maxBooksPossible, currentCombinedBooks);
    }

    outputResult(maxBooksPossible);
};

solveBookProblem();