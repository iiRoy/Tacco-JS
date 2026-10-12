const createInputProcessor = (sourceText) => {
    const lineSegments = sourceText.trim().split('\n');
    let currentLineIdx = 0;

    const convertToNum = (val, asString) => asString ? val : Number(val);

    const readLastToken = (asStringFlag) => {
        if (currentLineIdx >= lineSegments.length) {
            throw new Error("Input exhausted for readLastToken.");
        }
        let currentLineContent = lineSegments[currentLineIdx];
        if (typeof currentLineContent === 'string') {
            lineSegments[currentLineIdx] = currentLineContent.split(' ').reverse();
        }
        const tokens = lineSegments[currentLineIdx];
        const extractedToken = tokens.pop();
        if (tokens.length === 0) {
            currentLineIdx++;
        }
        return convertToNum(extractedToken, asStringFlag);
    };

    const readFullLine = (asStringFlag) => {
        if (currentLineIdx >= lineSegments.length) {
            throw new Error("Input exhausted for readFullLine.");
        }
        const line = lineSegments[currentLineIdx].split(' ');
        currentLineIdx++;
        return asStringFlag ? line : line.map(Number);
    };

    const readMultipleLines = (count, asStringFlag) => {
        const collected = [];
        for (let i = 0; i < count; i++) {
            if (currentLineIdx >= lineSegments.length) {
                throw new Error("Input exhausted for readMultipleLines.");
            }
            collected.push(lineSegments[currentLineIdx].split(' '));
            currentLineIdx++;
        }
        return asStringFlag ? collected : collected.map(row => row.map(Number));
    };

    const readRawLines = (count, asStringFlag) => {
        const collected = [];
        for (let i = 0; i < count; i++) {
            if (currentLineIdx >= lineSegments.length) {
                throw new Error("Input exhausted for readRawLines.");
            }
            collected.push(lineSegments[currentLineIdx]);
            currentLineIdx++;
        }
        return asStringFlag ? collected : collected.map(Number);
    };

    return {
        getSingle: readLastToken,
        getLineArray: readFullLine,
        getMatrix: readMultipleLines,
        getLineStrings: readRawLines
    };
};

const inputHandler = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function processCalculation() {
    const initialK = inputHandler.getSingle() - 1;
    const dataArray = inputHandler.getLineArray();

    if (dataArray[initialK] !== 2) {
        return -1;
    }

    const indicesToProcess = Array.from({ length: initialK }, (_, i) => initialK - 1 - i);

    const initialAccumulator = { lowerBound: 2, upperBound: 3 };

    const finalBounds = indicesToProcess.reduce((acc, currentIdx) => {
        if (acc === -1) return -1;

        const currentA = dataArray[currentIdx];
        let { lowerBound: d_val, upperBound: u_val } = acc;

        if (currentA > u_val) {
            return -1;
        }

        const next_d = currentA * Math.ceil(d_val / currentA);
        const next_u = Math.max((currentA * Math.ceil(u_val / currentA)), next_d + currentA) - 1;

        return { lowerBound: next_d, upperBound: next_u };
    }, initialAccumulator);

    if (finalBounds === -1) {
        return -1;
    } else {
        return `${finalBounds.lowerBound} ${finalBounds.upperBound}`;
    }
}

console.log(processCalculation());
