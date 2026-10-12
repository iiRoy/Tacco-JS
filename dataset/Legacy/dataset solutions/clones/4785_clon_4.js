let vertexCount = 0;
let edgeCount = 0;
let edgeData = [];
let pathRecords = [];
let memoizedRoutes = [];

const directEdgeMap = new Map();

const retrieveDirectWeight = (source, target) => {
  return directEdgeMap.get(`${source},${target}`) || 0;
};

const calculateCumulativeWeight = (startNode, endNode) => {
  if (startNode === endNode) {
    return 0;
  }
  let accumulatedWeight = 0;
  for (let current = startNode; current < endNode; current++) {
    accumulatedWeight += retrieveDirectWeight(current, endNode);
  }
  return accumulatedWeight;
};

const processGraphData = (inputContent) => {
  const lines = inputContent.split("\n");

  const [parsedN, parsedM] = lines[0].split(" ").map(Number);
  vertexCount = parsedN;
  edgeCount = parsedM;

  edgeData = lines.slice(1, edgeCount + 1).map((line) => line.split(" ").map(Number));

  edgeData.forEach(([from, to, weight]) => {
    directEdgeMap.set(`${from},${to}`, weight);
  });

  const initialPathEntries = Array.from({ length: vertexCount }, (_, i) => i + 1)
    .flatMap((nodeA) =>
      Array.from({ length: vertexCount }, (_, j) => j + 1)
        .filter((nodeB) => nodeA !== nodeB && nodeA < nodeB)
        .map((nodeB) => [nodeA, nodeB, 0])
    );
  
  pathRecords = initialPathEntries;
  memoizedRoutes = pathRecords;

  initialPathEntries.forEach(([currentI, currentJ, _]) => {
    const computedValue = calculateCumulativeWeight(currentI, currentJ);
    const directValue = retrieveDirectWeight(currentI, currentJ);

    console.log("i=", currentI, "j=", currentJ, "の最短値は");
    console.log("計算値=", computedValue);
    console.log("パラメータ=", directValue);
  });
};

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
