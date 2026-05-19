const MODULO_VALUE = 1000000007;
const WHITE_NODE_INDEX = 0;
const BLACK_NODE_INDEX = 1;
const NODE_UNVISITED = 0;
const NODE_VISITED = 1;

const performModularMultiplication = (val1, val2, mod) => (val1 * val2) % mod;

const ensureMinimumOne = (value) => Math.max(1, value);

function Main(inputData) {
  let inputLines = inputData.split("\n");
  let nodeCount = parseInt(inputLines[0]);

  let adjacencyList = new Array(nodeCount).fill(null).map(() => []);

  for (let i = 0; i < nodeCount - 1; i++) {
    let edgeStrParts = inputLines[i + 1].split(" ");
    let nodeU = parseInt(edgeStrParts[0]) - 1;
    let nodeV = parseInt(edgeStrParts[1]) - 1;
    adjacencyList[nodeU].push(nodeV);
    adjacencyList[nodeV].push(nodeU);
  }

  let coloringWays = new Array(nodeCount).fill(null).map(() => [0, 0]);
  let visitedStatus = new Array(nodeCount).fill(NODE_UNVISITED);

  let finalAnswer;

  if (nodeCount === 1) {
    finalAnswer = 2;
  } else {
    visitedStatus[0] = NODE_VISITED;

    for (let i = 0; i < nodeCount; i++) {
      if (adjacencyList[i].length === 1) {
        coloringWays[i][WHITE_NODE_INDEX] = 1;
        coloringWays[i][BLACK_NODE_INDEX] = 1;
        visitedStatus[i] = NODE_VISITED;
      }
    }
    coloringWays[0] = [0, 0];

    let processingStack = [0];

    while (processingStack.length > 0) {
      let currentProcessingNode = processingStack[processingStack.length - 1];
      let pushedNewChildFlag = false;

      let waysIfCurrentNodeWhite = 1;
      let waysIfCurrentNodeBlack = 1;

      for (let neighborNode of adjacencyList[currentProcessingNode]) {
        if (visitedStatus[neighborNode] === NODE_UNVISITED) {
          visitedStatus[neighborNode] = NODE_VISITED;
          processingStack.push(neighborNode);
          pushedNewChildFlag = true;
          break;
        } else {
          let childTotalWays = ensureMinimumOne(
            (coloringWays[neighborNode][WHITE_NODE_INDEX] + coloringWays[neighborNode][BLACK_NODE_INDEX]) % MODULO_VALUE
          );
          let childWhiteWays = ensureMinimumOne(coloringWays[neighborNode][WHITE_NODE_INDEX]);

          waysIfCurrentNodeWhite = performModularMultiplication(waysIfCurrentNodeWhite, childTotalWays, MODULO_VALUE);
          waysIfCurrentNodeBlack = performModularMultiplication(waysIfCurrentNodeBlack, childWhiteWays, MODULO_VALUE);
        }
      }

      if (!pushedNewChildFlag) {
        coloringWays[currentProcessingNode][WHITE_NODE_INDEX] = waysIfCurrentNodeWhite;
        coloringWays[currentProcessingNode][BLACK_NODE_INDEX] = waysIfCurrentNodeBlack;
        processingStack.pop();
      }
    }

    finalAnswer = (coloringWays[0][WHITE_NODE_INDEX] + coloringWays[0][BLACK_NODE_INDEX]) % MODULO_VALUE;
  }

  console.log('%s', finalAnswer);
  return finalAnswer;
}

function debug(n) {
  var input = document.getElementById("input" + n).value;
  var ans = Main(input);
  var result = "WA";
  if (ans == document.getElementById("output" + n).value.split("\n")[0]) {
    result = "AC";
  }
  document.getElementById("result" + n).innerHTML = result;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
