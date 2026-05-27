const INPUT_PARSER = (() => {
    function createParser(rawTextContent) {
        let sourceLines = rawTextContent.trim().split('\n');
        let lineCursor = 0;
        let currentLineBuffer = [];

        const retrieveNextAtom = (asStringOutput = false) => {
            if (currentLineBuffer.length === 0) {
                if (lineCursor >= sourceLines.length) {
                    throw new Error("End of input stream reached for atom retrieval.");
                }
                currentLineBuffer = sourceLines[lineCursor++].split(' ');
            }
            const extractedValue = currentLineBuffer.shift();
            return asStringOutput ? extractedValue : Number(extractedValue);
        };

        const retrieveNextLine = (asStringOutput = false) => {
            if (lineCursor >= sourceLines.length) {
                throw new Error("End of input stream reached for line retrieval.");
            }
            const fullLine = sourceLines[lineCursor++];
            const lineSegments = fullLine.split(' ');
            return asStringOutput ? lineSegments : lineSegments.map(Number);
        };

        const retrieveNextMatrix = (numRows, asStringOutput = false) => {
            const collectedMatrix = [];
            for (let i = 0; i < numRows; i++) {
                collectedMatrix.push(retrieveNextLine(asStringOutput));
            }
            return collectedMatrix;
        };

        const retrieveNextRawRows = (numRows, asStringOutput = false) => {
            if (lineCursor + numRows > sourceLines.length) {
                throw new Error("Not enough lines available for raw row retrieval.");
            }
            const selectedRows = sourceLines.slice(lineCursor, lineCursor + numRows);
            lineCursor += numRows;
            return asStringOutput ? selectedRows : selectedRows.map(Number);
        };

        return {
            atom: retrieveNextAtom,
            line: retrieveNextLine,
            matrix: retrieveNextMatrix,
            rows: retrieveNextRawRows,
        };
    }
    return createParser;
})();

const processInputData = () => {
    const dataReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));
    const coordinateSets = dataReader.matrix(3);

    const baseCoordinates = coordinateSets[0];

    const checkCoordinateTransformation = (targetCoordinates, baseCoords) => {
        const [baseX, baseY, baseZ] = baseCoords;
        const [targetX, targetY, targetZ] = targetCoordinates;

        const xDifference = targetX - baseX;
        const yDifference = targetY - baseY;
        const zDifference = targetZ - baseZ;

        return xDifference === yDifference && xDifference === zDifference;
    };

    const subsequentSets = coordinateSets.slice(1);

    const allTransformationsValid = subsequentSets.every(
        (currentSet) => checkCoordinateTransformation(currentSet, baseCoordinates)
    );

    return allTransformationsValid ? "Yes" : "No";
};

console.log(processInputData());
