"use strict"

const INPUT_SOURCE_PATH = "/dev/stdin";

function InputReader(sourcePath) {
    const fileContent = require("fs").readFileSync(sourcePath, "utf8").trim();
    this.lineList = fileContent.split("\n");
    this.currentIndex = 0;
    this.maxLines = this.lineList.length;
}

InputReader.prototype.hasMoreData = function() {
    return this.currentIndex < this.maxLines;
};

InputReader.prototype.fetchNextLine = function() {
    if (!this.hasMoreData()) {
        throw "ArrayIndexOutOfBoundsException";
    }
    return this.lineList[this.currentIndex++];
};

const initializeInputProcessor = () => {
    const processorInstance = new InputReader(INPUT_SOURCE_PATH);
    return processorInstance;
};

const globalInputProcessor = initializeInputProcessor();

const InputUtilities = {
    fetchNextLine: () => globalInputProcessor.fetchNextLine(),
    fetchNextInt: () => parseInt(globalInputProcessor.fetchNextLine()),
    fetchNextStringArray: () => globalInputProcessor.fetchNextLine().split(" "),
    fetchNextIntArray: () => globalInputProcessor.fetchNextLine().split(" ").map(currentElement => parseInt(currentElement)),
    fetchNextCharacterArray: () => globalInputProcessor.fetchNextLine().split(""),
    hasMoreData: () => globalInputProcessor.hasMoreData()
};

const outputResult = (...args) => console.log(...args);

const runApplication = () => {
    const [valN, valM] = InputUtilities.fetchNextIntArray();

    const powerOfTwoM = Math.pow(2, valM);

    outputResult(1900 * valM + 100(valN - valM) * powerOfTwoM);
};

runApplication();
