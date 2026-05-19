function Main(input) {
  const inputLines = input.split("\n");
  const [nodeCount, edgeCount] = inputLines[0].split(" ").map(Number);

  const edgeStrings = inputLines.slice(1, inputLines.length - 2);
  const edges = edgeStrings.map(s => s.split(" ").map(Number));

  const forwardAdjacency = new Map();
  const backwardAdjacency = new Map();
  const nodeOutDegrees = new Map();
  const allInvolvedNodes = new Set();

  for (const [u, v] of edges) {
    if (!forwardAdjacency.has(u)) {
      forwardAdjacency.set(u, []);
    }
    forwardAdjacency.get(u).push(v);

    if (!backwardAdjacency.has(v)) {
      backwardAdjacency.set(v, []);
    }
    backwardAdjacency.get(v).push(u);

    nodeOutDegrees.set(u, (nodeOutDegrees.get(u) || 0) + 1);

    allInvolvedNodes.add(u);
    allInvolvedNodes.add(v);
  }

  const processingQueue = [];
  const reverseTopologicalOrder = [];
  const currentOutDegrees = new Map(nodeOutDegrees);

  for (const node of allInvolvedNodes) {
    if (!currentOutDegrees.has(node) || currentOutDegrees.get(node) === 0) {
      processingQueue.push(node);
    }
  }

  while (processingQueue.length > 0) {
    const currentNode = processingQueue.shift();
    reverseTopologicalOrder.push(currentNode);

    const predecessors = backwardAdjacency.get(currentNode) || [];
    for (const predNode of predecessors) {
      currentOutDegrees.set(predNode, currentOutDegrees.get(predNode) - 1);
      if (currentOutDegrees.get(predNode) === 0) {
        processingQueue.push(predNode);
      }
    }
  }

  const longestPathFromNode = new Map();
  for (const node of allInvolvedNodes) {
    longestPathFromNode.set(node, 0);
  }

  let overallMaxPath = 0;

  for (const node of reverseTopologicalOrder) {
    let currentMaxForNode = 0;
    const neighbors = forwardAdjacency.get(node) || [];

    for (const neighbor of neighbors) {
      currentMaxForNode = Math.max(currentMaxForNode, 1 + (longestPathFromNode.get(neighbor) || 0));
    }
    longestPathFromNode.set(node, currentMaxForNode);
    overallMaxPath = Math.max(overallMaxPath, currentMaxForNode);
  }

  console.log('%s', overallMaxPath);
  return overallMaxPath;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=Main(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
