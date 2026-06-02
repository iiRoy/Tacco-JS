const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const lineSegments = fileContent.trim().split("\n");

class LineIterator {
    #sourceLines;
    #currentPosition;

    constructor(lines) {
        this.#sourceLines = lines;
        this.#currentPosition = 0;
    }

    fetchNext() {
        if (!this.hasMore()) {
            throw "NoSuchElementException:次に要素は無いよ";
        }
        const currentLine = this.#sourceLines[this.#currentPosition];
        this.#currentPosition++;
        return currentLine;
    }

    hasMore() {
        return this.#currentPosition < this.#sourceLines.length;
    }
}

const inputSource = new LineIterator(lineSegments);

const dataConverter = (value, conversionType) => {
    try {
        const conversionMap = {
            1: (v) => parseInt(v),
            2: (v) => v.split(" "),
            4: (v) => v.split(" ").map(Number),
            6: (v) => v.split(""),
            7: (v) => v.split("").map(Number),
            8: (v) => value.join(" "),
            9: (v) => value.join("\n"),
            0: (v) => value.join(""),
        };
        return (conversionMap[conversionType] || ((v) => v))(value);
    } catch (error) {
        return value;
    }
};

function retrieveNextLine() {
    return inputSource.fetchNext();
}

function parseNextInteger() {
    return dataConverter(retrieveNextLine(), 1);
}

function splitNextLineBySpace() {
    return dataConverter(retrieveNextLine(), 2);
}

function parseNextIntegerArray() {
    return dataConverter(retrieveNextLine(), 4);
}

function splitNextLineByChar() {
    return dataConverter(retrieveNextLine(), 6);
}

function hasMoreLines() {
    return inputSource.hasMore();
}

function displayOutput(content) {
    console.log(content);
}

function displayError(content) {
    console.error(content);
}

function processCalculation() {
    const inputNumber = parseNextInteger();

    const baseResult = Math.floor(inputNumber / 11) * 2;
    const remainderValue = inputNumber % 11;

    const additionalValue = (remainderValue >= 7) ? 2 : ((remainderValue > 0) ? 1 : 0);

    const finalResult = baseResult + additionalValue;

    displayOutput(finalResult);
}

processCalculation();
