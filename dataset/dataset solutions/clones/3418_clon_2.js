function ProcessInput(rawData) {
  rawData = rawData.split("\n");
  let levelCount = parseInt(rawData[0].split(" ")[0]);
  let targetPosition = parseInt(rawData[0].split(" ")[1]);
  
  let pattyCounts = new Array(50);
  let totalLayerCounts = new Array(50);
  
  pattyCounts[0] = 1;
  totalLayerCounts[0] = 1;
  
  let resultPatties = 0;
  
  for (let idx = 1; idx <= 50; idx++) {
    pattyCounts[idx] = pattyCounts[idx - 1] * 2 + 1;
    totalLayerCounts[idx] = totalLayerCounts[idx - 1] * 2 + 3;
  }
  
  let currentTotalLayers = totalLayerCounts[levelCount];
  let currentPattyCount = pattyCounts[levelCount];
  
  while (targetPosition > 0) {
    if (targetPosition > (currentTotalLayers - 1) / 2) {
      targetPosition = targetPosition - (currentTotalLayers - 1) / 2 - 1;
      resultPatties = resultPatties + (currentPattyCount - 1) / 2 + 1;
      currentTotalLayers = (currentTotalLayers - 1) / 2 - 1;
      currentPattyCount = (currentPattyCount - 1) / 2;
    } else {
      targetPosition = targetPosition - 1;
      currentTotalLayers = (currentTotalLayers - 1) / 2 - 1;
      currentPattyCount = (currentPattyCount - 1) / 2;
    }
  }
  
  console.log('%s', resultPatties);
}
  
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
