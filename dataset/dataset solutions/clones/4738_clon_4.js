class DataReader {
    constructor(sourceText) {
        this.allLines = sourceText.trim().split("\n");
        this.currentPosition = 0;
        this.totalLines = this.allLines.length;
    }

    fetchNextLine() {
        if (!this.stillHasData()) {
            throw new Error("NoMoreDataException: Data stream exhausted.");
        }
        const fetchedLine = this.allLines[this.currentPosition];
        this.currentPosition++;
        return fetchedLine;
    }

    stillHasData() {
        return this.currentPosition < this.totalLines;
    }
}

const dataTransformers = {
    1: (val) => parseInt(val, 10),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (arr) => arr.join(" "),
    9: (arr) => arr.join("\n"),
    0: (arr) => arr.join(""),
    default: (val) => val
};

function processData(dataElement, transformKey) {
    try {
        const transformFunction = dataTransformers[transformKey] || dataTransformers.default;
        return transformFunction(dataElement);
    } catch (error) {
        return dataTransformers.default(dataElement);
    }
}

const globalReader = new DataReader(require("fs").readFileSync("/dev/stdin", "utf8"));

const acquireEntry = () => globalReader.fetchNextLine();
const acquireInteger = () => processData(acquireEntry(), 1);
const acquireStringArray = () => processData(acquireEntry(), 2);
const acquireIntegerArray = () => processData(acquireEntry(), 4);
const acquireCharacterArray = () => processData(acquireEntry(), 6);
const checkAvailability = () => globalReader.stillHasData();

const emitResult = (content) => console.log(content);
const emitError = (content) => console.error(content);

const performCalculation = () => {
    const primaryValue = acquireInteger();
    
    const baseScore = ((primaryValue / 11) | 0) * 2;
    
    const remainder = primaryValue % 11;
    
    const remainderScore = (remainder === 0) ? 0 : (remainder >= 7) ? 2 : 1;
    
    const finalScore = baseScore + remainderScore;
    
    emitResult(finalScore);
};

performCalculation();