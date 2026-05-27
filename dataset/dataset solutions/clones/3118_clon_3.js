class InputReader {
    constructor(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    readNextValue(asString = false) {
        let currentLineContent = this.sourceLines[this.currentLineIndex];
        if (typeof currentLineContent === "string") {
            this.sourceLines[this.currentLineIndex] = currentLineContent.split(" ").reverse();
        }
        let extractedValue = this.sourceLines[this.currentLineIndex].pop();
        if (!this.sourceLines[this.currentLineIndex].length) {
            this.currentLineIndex++;
        }
        return asString ? extractedValue : +extractedValue;
    }

    readLineValues(asStrings = false) {
        const lineContent = this.sourceLines[this.currentLineIndex++];
        const values = lineContent.split(" ");
        return asStrings ? values : values.map(val => +val);
    }

    readMatrix(numRows, asStrings = false) {
        const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
        this.currentLineIndex += numRows;
        const parsedMatrix = matrixRows.map(row => row.split(" "));
        return asStrings ? parsedMatrix : parsedMatrix.map(row => row.map(val => +val));
    }

    readRawLines(numLines, asStrings = true) {
        const lines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
        this.currentLineIndex += numLines;
        return asStrings ? lines : lines.map(a => +a);
    }
}

const createInputParser = (source) => new InputReader(source);

const getFileContent = (filePath) => require("fs").readFileSync(filePath, "utf8");

function processGraphData() {
    const inputSource = getFileContent("/dev/stdin");
    const inputReader = createInputParser(inputSource);

    const nodeCount = inputReader.readNextValue();
    const edgeCount = inputReader.readNextValue();

    const INITIAL_DEGREE_VALUE = 0;
    const degreeCounts = Array(nodeCount + 1).fill(INITIAL_DEGREE_VALUE);

    const updateNodeDegrees = (u, v, degreesArray) => {
        degreesArray[u]++;
        degreesArray[v]++;
    };

    for (let i = 0; i < edgeCount; i++) {
        const edgeEndpoints = inputReader.readLineValues();
        const [u, v] = edgeEndpoints;
        updateNodeDegrees(u, v, degreeCounts);
    }

    let totalDegreeDifference = 0;
    const MIN_DEGREE_FOR_CALC = 2;

    for (let nodeIndex = 1; nodeIndex <= nodeCount; nodeIndex++) {
        const currentDegree = degreeCounts[nodeIndex];
        if (currentDegree % 2 !== 0) {
            return "No";
        }
        totalDegreeDifference += (currentDegree - MIN_DEGREE_FOR_CALC);
    }

    const checkFinalCondition = (sumOfDifferences) => {
        const THRESHOLD_VALUE = 4;
        return sumOfDifferences >= THRESHOLD_VALUE ? "Yes" : "No";
    };

    return checkFinalCondition(totalDegreeDifference);
}

console.log(processGraphData());
