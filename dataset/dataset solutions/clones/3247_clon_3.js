// inputに入力データ全体が入る
function Main(rawData) {
    // Helper function to parse a line of space-separated numbers into an array of integers
    const parseLineToInts = (lineContent) => lineContent.split(" ").map(strVal => parseInt(strVal, 10));

    // Split the raw input data into individual lines
    const lineData = rawData.split("\n");

    // Parse the first line to get the initial parameters (node count and edge count)
    const initialParameters = parseLineToInts(lineData[0]);
    const nodeCount = initialParameters[0];
    const edgeCount = initialParameters[1];

    // Initialize arrays to store source and target nodes from the edges
    const sourceNodes = [];
    const targetNodes = [];

    // Calculate the total number of input rows that represent edges
    const totalEdgeRows = nodeCount - 1 + edgeCount;

    // Loop through the input lines representing edges
    for (let rowIndex = 1; rowIndex <= totalEdgeRows; rowIndex++) {
        const currentEdgeRow = parseLineToInts(lineData[rowIndex]);
        sourceNodes.push(currentEdgeRow[0]);
        targetNodes.push(currentEdgeRow[1]);
    }

    // Initialize arrays and variables for the final output
    const terminalNodes = [];
    let potentialRootNode = 0; // This variable will hold the last node found that is not a target

    // Iterate through all possible node identifiers from 1 to nodeCount
    for (let currentNodeId = 1; currentNodeId <= nodeCount; currentNodeId++) {
        // Determine if the current node is a source node
        const isCurrentNodeASource = sourceNodes.includes(currentNodeId);
        // If it's not a source node, it's considered a terminal node (a leaf in some contexts)
        if (!isCurrentNodeASource) {
            terminalNodes.push(currentNodeId);
        }

        // Determine if the current node is a target node
        const isCurrentNodeATarget = targetNodes.includes(currentNodeId);
        // If it's not a target node, it's a candidate for a root node.
        // The last such node found will be the one assigned to potentialRootNode.
        if (!isCurrentNodeATarget) {
            potentialRootNode = currentNodeId;
        }
    }

    // Output the collected terminal nodes and the identified potential root node
    console.log(terminalNodes, potentialRootNode);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
