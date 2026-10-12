const sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const lineProvider = (() => {
    let currentLineIndex = 0;
    const totalLines = sourceLines.length;

    const retrieveNextLine = () => {
        if (currentLineIndex >= totalLines) {
            throw new Error("NoSuchElementException:次に要素は無いよ");
        }
        return sourceLines[currentLineIndex++];
    };

    const checkMoreLines = () => currentLineIndex < totalLines;

    return { retrieveNextLine, checkMoreLines };
})();

function getNextLine() { return lineProvider.retrieveNextLine(); }
function getNextInteger() { return dataTransformer(getNextLine(), 1); }
function getNextStringArray() { return dataTransformer(getNextLine(), 2); }
function getNextIntegerArray() { return dataTransformer(getNextLine(), 4); }
function getNextCharacterArray() { return dataTransformer(getNextLine(), 6); }
function hasMoreLines() { return lineProvider.checkMoreLines(); }

function myout(content) { console.log(content); }
function myerr(content) { console.error(content); }

const conversionHandlers = {
    1: (val) => Number.parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join(""),
};

function dataTransformer(sourceValue, transformKey) {
    try {
        const handler = conversionHandlers[transformKey];
        return handler ? handler(sourceValue) : sourceValue;
    } catch (err) {
        return sourceValue;
    }
}

function analyzeConnections() {
    const initialParameters = getNextIntegerArray();
    const targetNode = initialParameters[0];
    const edgeCount = initialParameters[1];

    const nodesReachableFromStart = new Set();
    const nodesReachingTarget = new Set();
    let pathFoundFlag = false;

    sourceLines.slice(1, edgeCount + 1).forEach(edgeLine => {
        const [source, destination] = dataTransformer(edgeLine, 4);
        if (source === 1) {
            nodesReachableFromStart.add(destination);
        }
        if (destination === targetNode) {
            nodesReachingTarget.add(source);
        }
    });

    myerr(nodesReachableFromStart);
    myerr(nodesReachingTarget);

    pathFoundFlag = Array.from(nodesReachingTarget.values()).some(intermediateNode =>
        nodesReachableFromStart.has(intermediateNode)
    );

    if (pathFoundFlag) {
        myout("POSSIBLE");
    } else {
        myout("IMPOSSIBLE");
    }
}

analyzeConnections();
