"use strict"
class InputLineProcessor {
    constructor(sourceFilePath) {
        this.dataLines = require("fs").readFileSync(sourceFilePath, "utf8").trim().split("\n");
        this.currentLineIndex = 0;
        this.totalLines = this.dataLines.length;
    }

    hasMoreLines() {
        return this.currentLineIndex < this.totalLines;
    }

    getNextLine() {
        if (!this.hasMoreLines()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.dataLines[this.currentLineIndex++];
    }
}

const globalInputReader = new InputLineProcessor("/dev/stdin");

const readNextLine = () => globalInputReader.getNextLine();
const readNextInteger = () => parseInt(globalInputReader.getNextLine());
const readNextStringArray = () => globalInputReader.getNextLine().split(" ");
const readNextIntegerArray = () => globalInputReader.getNextLine().split(" ").map(element => parseInt(element));
const readNextCharacterArray = () => globalInputReader.getNextLine().split("");
const checkHasMoreLines = () => globalInputReader.hasMoreLines();
const outputResult = (...args) => console.log(...args);

const executeSolution = () => {
    // The variable 'n' from the original code was assigned but never used.
    // let problemCount = readNextInteger();

    const resultCounters = {
        "AC": 0,
        "WA": 0,
        "TLE": 0,
        "RE": 0
    };

    while (checkHasMoreLines()) {
        const currentResultString = readNextLine();
        switch (currentResultString) {
            case "AC":
                resultCounters.AC++;
                break;
            case "WA":
                resultCounters.WA++;
                break;
            case "TLE":
                resultCounters.TLE++;
                break;
            case "RE":
                resultCounters.RE++;
                break;
            // No default case needed as per problem constraints, assuming valid inputs.
        }
    }

    const categoriesToPrint = ["AC", "WA", "TLE", "RE"];
    for (const category of categoriesToPrint) {
        outputResult(`${category} x ${resultCounters[category]}`);
    }
}

executeSolution();
