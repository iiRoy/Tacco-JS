function calculateTreeDP(currentVertex, parentVertex, graphStructure, modulusValue) {
    let whiteProduct = 1;
    let blackProduct = 1;

    for (const adjacentVertex of graphStructure[currentVertex]) {
        if (adjacentVertex !== parentVertex) {
            const [childWhiteSum, childBlackSum] = calculateTreeDP(adjacentVertex, currentVertex, graphStructure, modulusValue);

            const combinedChildSum = (childWhiteSum + childBlackSum) % modulusValue;
            const effectiveCombinedChildSum = combinedChildSum === 0 ? 1 : combinedChildSum;

            const effectiveChildWhiteSum = childWhiteSum === 0 ? 1 : childWhiteSum;

            whiteProduct = (whiteProduct * effectiveCombinedChildSum) % modulusValue;
            blackProduct = (blackProduct * effectiveChildWhiteSum) % modulusValue;
        }
    }
    return [whiteProduct, blackProduct];
}

function ProcessInput(rawInput) {
    const inputLines = rawInput.split("\n");
    const nodeQuantity = parseInt(inputLines[0]);
    const adjacencyMatrix = Array.from({ length: nodeQuantity }, () => []);
    const primeConstant = Math.pow(10, 9) + 7;

    for (let i = 0; i < nodeQuantity - 1; i++) {
        const [nodeA, nodeB] = inputLines[i + 1].split(" ").map(Number);
        adjacencyMatrix[nodeA - 1].push(nodeB - 1);
        adjacencyMatrix[nodeB - 1].push(nodeA - 1);
    }

    if (nodeQuantity === 1) {
        return 2;
    }

    const [finalWhiteCount, finalBlackCount] = calculateTreeDP(0, -1, adjacencyMatrix, primeConstant);

    return (finalWhiteCount + finalBlackCount) % primeConstant;
}

function Main(input) {
    const finalAnswer = ProcessInput(input);
    console.log('%s', finalAnswer);
    return finalAnswer;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=ProcessInput(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
