const printResult = (val) => console.log(val);
const debugLog = (msg) => console.error("debug:" + require("util").inspect(msg, false, null));

let inputLinesBuffer = [];
const rli = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

rli.on('line', (line) => {
  inputLinesBuffer.push(line);
});

rli.on('close', () => {
  const start = Date.now();
  mainLogic(inputLinesBuffer);
  const end = Date.now() - start;
  debugLog("time : " + end + "ms");
  debugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function mainLogic(allInputLines) {
  const inputLineReader = (function* (lines) {
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
      yield lines[currentLineIndex++];
    }
  })(allInputLines);

  const fetchNextLine = () => inputLineReader.next().value;
  const fetchNextIntArray = () => fetchNextLine().split(" ").map(Number);

  const [nodeCount, edgeCount] = fetchNextIntArray();

  const graphNodes = Array.from({ length: nodeCount }, () => ({
    fwd: [],
    rev3: new Set(),
    dist: -1
  }));

  Array.from({ length: edgeCount }).forEach(() => {
    const [sourceNode, destinationNode] = fetchNextIntArray();
    graphNodes[sourceNode - 1].fwd.push(destinationNode - 1);
  });

  for (let u = 0; u < nodeCount; u++) {
    for (const v of graphNodes[u].fwd) {
      for (const w of graphNodes[v].fwd) {
        for (const x of graphNodes[w].fwd) {
          graphNodes[x].rev3.add(u);
        }
      }
    }
  }

  const [startNodeIndex, targetNodeIndex] = fetchNextIntArray().map(n => n - 1);

  const bfsTraversalQueue = [];
  let finalPathLength = -1;

  bfsTraversalQueue.push(targetNodeIndex);
  graphNodes[targetNodeIndex].dist = 0;

  while (bfsTraversalQueue.length > 0) {
    const currentProcessingNode = bfsTraversalQueue.shift();
    const currentPathDistance = graphNodes[currentProcessingNode].dist;

    if (currentProcessingNode === startNodeIndex) {
      finalPathLength = currentPathDistance;
      break;
    }

    for (const threeStepParent of graphNodes[currentProcessingNode].rev3) {
      if (graphNodes[threeStepParent].dist === -1) {
        graphNodes[threeStepParent].dist = currentPathDistance + 1;
        bfsTraversalQueue.push(threeStepParent);
      }
    }
  }

  printResult(finalPathLength);
}
