class InputProcessor {
    constructor(inputLines) {
        this.lines = inputLines;
        this.linePointer = 0;
    }

    hasMoreLines() {
        return this.linePointer < this.lines.length;
    }

    fetchNextLine() {
        if (!this.hasMoreLines()) {
            throw "ArrayIndexOutOfBoundsException ‚There is no more input";
        }
        return this.lines[this.linePointer++];
    }

    fetchInt() {
        return parseInt(this.fetchNextLine(), 10);
    }

    fetchStrArray() {
        return this.fetchNextLine().split(" ");
    }

    fetchIntArray() {
        return this.fetchNextLine().split(" ").map(Number);
    }

    fetchCharArray() {
        return this.fetchNextLine().split("");
    }
}

let inputReader;
const inputBuffer = [];

require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', line => inputBuffer.push(line))
  .on('close', () => {
    inputReader = new InputProcessor(inputBuffer);
    console.error("\n");
    const startTime = Date.now();
    executePrimaryLogic();
    const endTime = Date.now() - startTime;
    outputDebug(`time : ${endTime}ms`);
    outputDebug(`memory : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

function deepCopyObject(sourceObject) {
    return JSON.parse(JSON.stringify(sourceObject));
}

function outputResult(data) {
    console.log(data);
}

function outputDebug(data) {
    console.error("debug:" + require("util").inspect(data, false, null));
}

const ArrayFormatter = {
    joinWithSpace: arr => arr.join(" "),
    joinWithNewline: arr => arr.join("\n"),
    joinWithoutSeparator: arr => arr.join("")
};

function executePrimaryLogic() {
    const dimensions = inputReader.fetchIntArray();
    let currentHeight = dimensions[0];
    let currentWidth = dimensions[1];

    let minimumDifference = Infinity;

    const calculateMinMaxAreaDiff = (h, w, cutRow) => {
        // Division strategy 1: Three horizontal strips
        const areasA = [
            cutRow * w,
            Math.floor((h - cutRow) / 2) * w,
            Math.ceil((h - cutRow) / 2) * w
        ];
        const diffA = Math.max(...areasA) - Math.min(...areasA);

        // Division strategy 2: One horizontal strip, remaining rectangle split vertically
        const areasB = [
            cutRow * w,
            (h - cutRow) * Math.floor(w / 2),
            (h - cutRow) * Math.ceil(w / 2)
        ];
        const diffB = Math.max(...areasB) - Math.min(...areasB);

        return Math.min(diffA, diffB);
    };

    // Evaluate divisions for the initial (height, width) orientation
    minimumDifference = Array.from({ length: currentHeight - 2 }, (_, idx) => idx + 1)
        .reduce((minDiffAccumulator, cutRowIndex) => {
            return Math.min(minDiffAccumulator, calculateMinMaxAreaDiff(currentHeight, currentWidth, cutRowIndex));
        }, minimumDifference);

    // Swap dimensions to evaluate the other orientation
    [currentHeight, currentWidth] = [currentWidth, currentHeight];

    // Evaluate divisions for the swapped (width, height) orientation
    minimumDifference = Array.from({ length: currentHeight - 2 }, (_, idx) => idx + 1)
        .reduce((minDiffAccumulator, cutRowIndex) => {
            return Math.min(minDiffAccumulator, calculateMinMaxAreaDiff(currentHeight, currentWidth, cutRowIndex));
        }, minimumDifference);

    outputResult(minimumDifference);
}
