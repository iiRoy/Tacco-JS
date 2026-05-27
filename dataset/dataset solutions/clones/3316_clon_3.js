const UNCOMPUTED_STATE = -1;

function solveGraphProblem(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const parseInteger = (str) => parseInt(str, 10);

  const firstLineParts = inputLines[0].split(" ");
  const numNodes = parseInteger(firstLineParts[0]);
  const numEdges = parseInteger(firstLineParts[1]);

  const graphAdjacency = new Array(numNodes + 1);
  const distinctStartNodes = new Set();

  const edgeDataLines = inputLines.slice(1).filter(line => line.trim() !== '');

  for (const line of edgeDataLines) {
    const edgeEntry = line.split(" ").map(parseInteger);
    const sourceNode = edgeEntry[0];
    const targetNode = edgeEntry[1];

    if (graphAdjacency[sourceNode] === undefined) {
      graphAdjacency[sourceNode] = [];
    }
    graphAdjacency[sourceNode].push(targetNode);
    distinctStartNodes.add(sourceNode);
  }

  const sortedUniqueNodes = [...distinctStartNodes].sort((a, b) => a - b);

  const memoizedPathLengths = new Array(numNodes + 1).fill(UNCOMPUTED_STATE);

  let overallMaxPath = 0;

  const computeLongestPathFrom = (currNode) => {
    if (memoizedPathLengths[currNode] !== UNCOMPUTED_STATE) {
      return memoizedPathLengths[currNode];
    }

    if (graphAdjacency[currNode] === undefined || graphAdjacency[currNode].length === 0) {
      memoizedPathLengths[currNode] = 0;
      return 0;
    }

    let localMaxPath = 0;

    for (const neighborNode of graphAdjacency[currNode]) {
      const pathSegmentLength = computeLongestPathFrom(neighborNode) + 1;
      localMaxPath = Math.max(localMaxPath, pathSegmentLength);
    }

    memoizedPathLengths[currNode] = localMaxPath;
    return localMaxPath;
  };

  for (const node of sortedUniqueNodes) {
    const pathLengthFromNode = computeLongestPathFrom(node);
    overallMaxPath = Math.max(overallMaxPath, pathLengthFromNode);
  }

  console.log(overallMaxPath);
  return overallMaxPath;
}

function testSolution(testCaseNumber) {
  const inputElement = document.getElementById("input" + testCaseNumber);
  const outputElement = document.getElementById("output" + testCaseNumber);
  const resultElement = document.getElementById("result" + testCaseNumber);

  if (!inputElement || !outputElement || !resultElement) {
    console.error("Debug elements not found for test case:", testCaseNumber);
    return;
  }

  const testInput = inputElement.value;
  const actualAnswer = solveGraphProblem(testInput);
  const expectedAnswer = parseInt(outputElement.value.split("\n")[0], 10);

  let testResult = "WA";
  if (actualAnswer === expectedAnswer) {
    testResult = "AC";
  }
  resultElement.innerHTML = testResult;
}

solveGraphProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
