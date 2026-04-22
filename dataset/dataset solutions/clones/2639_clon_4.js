const processInputData = (inputString) => {
    const lines = inputString.trim().split("\n");

    const firstLineParts = lines[0].split(" ");
    const numberOfVertices = parseInt(firstLineParts[0]);
    const numberOfOperations = parseInt(firstLineParts[1]);

    const connectionInfo = lines.slice(1, numberOfVertices).map(line => line.split(" ").map(Number));
    const operationInfo = lines.slice(numberOfVertices, numberOfVertices + 1 + numberOfOperations).map(line => line.split(" ").map(Number));

    const descendantLinks = Array(numberOfVertices).fill().map(() => []);

    const vertexValues = Array(numberOfVertices).fill(0);

    for (const [parentVertex, childVertex] of connectionInfo) {
        descendantLinks[parentVertex - 1].push(childVertex - 1);
    }

    for (const [targetVertex, valueIncrement] of operationInfo) {
        vertexValues[targetVertex - 1] += valueIncrement;
    }

    const spreadValues = (currentVertexIndex, inheritedAmount) => {
        vertexValues[currentVertexIndex] += inheritedAmount;

        for (const childIndex of descendantLinks[currentVertexIndex]) {
            spreadValues(childIndex, vertexValues[currentVertexIndex]);
        }
    };

    spreadValues(0, 0);

    console.log(vertexValues.join(" "));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));