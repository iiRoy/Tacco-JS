const fileSystem = require("node:fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8").trim();
const lineSegments = rawInputContent.split("\n");

class DataInputProcessor {
    #segmentsArray;
    #currentPosition = 0;

    constructor(initialSegments) {
        this.#segmentsArray = initialSegments;
    }

    checkAvailability() {
        return this.#currentPosition < this.#segmentsArray.length;
    }

    retrieveNextLine() {
        if (!this.checkAvailability()) {
            return "";
        }
        return this.#segmentsArray[this.#currentPosition++];
    }

    retrieveNextNumericValue() {
        const fetchedLine = this.retrieveNextLine();
        return fetchedLine === "" ? NaN : Number.parseInt(fetchedLine, 10);
    }
}

const inputProvider = new DataInputProcessor(lineSegments);

const processNumberSequence = (currentNumbers, remainingIterations) => {
    if (remainingIterations === 0) {
        return currentNumbers[0];
    }

    const nextIterationNumbers = Array.from({ length: currentNumbers.length / 2 }, (_, idx) => {
        const itemOne = currentNumbers[idx * 2];
        const itemTwo = currentNumbers[idx * 2 + 1];
        return (itemOne === itemTwo) ? itemOne : Math.abs(itemOne - itemTwo);
    });

    return processNumberSequence(nextIterationNumbers, remainingIterations - 1);
};

function executePrimaryLogic() {
    const exponentForLength = inputProvider.retrieveNextNumericValue();
    const sequenceLength = Math.pow(2, exponentForLength);
    const initialNumericSequence = [];

    for (let loopCounter = 0; loopCounter < sequenceLength; loopCounter++) {
        initialNumericSequence.push(inputProvider.retrieveNextNumericValue());
    }

    const finalCalculatedValue = processNumberSequence(initialNumericSequence, exponentForLength);
    console.log(finalCalculatedValue);
}

executePrimaryLogic();