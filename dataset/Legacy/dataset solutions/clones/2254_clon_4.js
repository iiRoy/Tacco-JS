function Main(input) {
  const lines = input.split('\n');
  const [rows, cols] = lines[0].split(' ').map(Number);
  const infinityValue = Math.pow(10, 9) + 7;
  const gridContent = lines.slice(1, 1 + rows).map(line => line.split(''));

  const adjacencyLists = Array.from({ length: rows * cols }, () => []);
  const pathableNodes = [];

  for (let rIdx = 0; rIdx < rows; rIdx++) {
    for (let cIdx = 0; cIdx < cols; cIdx++) {
      const currentCellId = rIdx * cols + cIdx;
      if (gridContent[rIdx][cIdx] === '.') {
        pathableNodes.push(currentCellId);

        if (rIdx + 1 < rows && gridContent[rIdx + 1][cIdx] === '.') {
          const downCellId = (rIdx + 1) * cols + cIdx;
          adjacencyLists[currentCellId].push(downCellId);
          adjacencyLists[downCellId].push(currentCellId);
        }

        if (cIdx + 1 < cols && gridContent[rIdx][cIdx + 1] === '.') {
          const rightCellId = rIdx * cols + (cIdx + 1);
          adjacencyLists[currentCellId].push(rightCellId);
          adjacencyLists[rightCellId].push(currentCellId);
        }
      }
    }
  }

  let overallMaxDistance = 0;

  for (const sourceNode of pathableNodes) {
    const currentDistances = new Array(rows * cols).fill(infinityValue);
    currentDistances[sourceNode] = 0;
    const traversalQueue = [sourceNode];
    let queuePointer = 0;
    let maxDistanceForSource = 0;

    while (queuePointer < traversalQueue.length) {
      const activeNode = traversalQueue[queuePointer++];
      maxDistanceForSource = Math.max(maxDistanceForSource, currentDistances[activeNode]);

      for (const adjacentNode of adjacencyLists[activeNode]) {
        if (currentDistances[adjacentNode] === infinityValue) {
          currentDistances[adjacentNode] = currentDistances[activeNode] + 1;
          traversalQueue.push(adjacentNode);
        }
      }
    }
    overallMaxDistance = Math.max(overallMaxDistance, maxDistanceForSource);
  }

  console.log(overallMaxDistance.toString());
  return overallMaxDistance;
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
