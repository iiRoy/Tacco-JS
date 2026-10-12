const fileSystem = require("fs");

const processInputData = (inputLines) => {
    const nodeCountValue = Number(inputLines[0]);

    // The original code parses (nodeCountValue - 1) lines for edges.
    // We must replicate this input consumption behavior, even if the parsed data is not used.
    for (let currentEdgeIndex = 0; currentEdgeIndex < nodeCountValue - 1; currentEdgeIndex++) {
        inputLines[currentEdgeIndex + 1].split(" ").map(Number);
    }

    // The original code parses the line at index 'nodeCountValue' for query count and a special node ID.
    const queryAndSpecialNodeLine = inputLines[nodeCountValue];
    const parsedQueryAndSpecialNode = queryAndSpecialNodeLine.split(" ").map(Number);
    const numberOfQueries = parsedQueryAndSpecialNode[0];
    // const specialNodeIdentifier = parsedQueryAndSpecialNode[1]; // This value is not used in the simplified logic.

    // The original code then processes 'numberOfQueries' lines for query pairs.
    // We must replicate this input consumption behavior.
    for (let currentQueryIndex = 0; currentQueryIndex < numberOfQueries; currentQueryIndex++) {
        // The original code parses the line at index (currentQueryIndex + nodeCountValue + 1).
        inputLines[currentQueryIndex + nodeCountValue + 1].split(" ").map(Number);
        // Based on strict analysis of the original code's graph construction and traversal,
        // the distance array 'v' remains filled with -1.
        // Therefore, the sum of distances 'w' will always be -1 + -1 = -2.
        console.log(-2);
    }
};

// Main execution flow, replacing the webpack boilerplate.
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "UTF-8");
const allInputLines = rawInputContent.split("\n");
processInputData(allInputLines);
