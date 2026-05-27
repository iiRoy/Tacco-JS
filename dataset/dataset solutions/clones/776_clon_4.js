let rawInputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  rawInputBuffer += chunk;
});
process.stdin.on('end', () => {
  const inputLines = rawInputBuffer.split('\n');
  let currentLineIndex = 0;

  const retrieveAndSplitLine = () => inputLines[currentLineIndex++].split(' ');

  const initialConfiguration = retrieveAndSplitLine();
  const nodeCount = +initialConfiguration[0];
  const edgeCountPlaceholder = +initialConfiguration[1]; // This variable remains unused, mirroring original behavior
  const startNodeIndex = +initialConfiguration[2] - 1;
  const goalOneIndex = +initialConfiguration[3] - 1;
  const goalTwoIndex = +initialConfiguration[4] - 1;

  const pathDistances = new Map();

  for (let r = 0; r < nodeCount; r++) {
    for (let c = 0; c < nodeCount; c++) {
      pathDistances.set(`${r}_${c}`, r === c ? 0 : Infinity);
    }
  }

  while (inputLines[currentLineIndex] !== '0 0 0 0 0') {
    const edgeDetails = retrieveAndSplitLine();
    const originNode = +edgeDetails[0] - 1;
    const destinationNode = +edgeDetails[1] - 1;
    const edgeWeight = +edgeDetails[2];
    pathDistances.set(`${originNode}_${destinationNode}`, edgeWeight);
  }
  // Consume the '0 0 0 0 0' line
  currentLineIndex++;

  for (let transitNode = 0; transitNode < nodeCount; transitNode++) {
    for (let source = 0; source < nodeCount; source++) {
      for (let target = 0; target < nodeCount; target++) {
        const currentPathLength = pathDistances.get(`${source}_${target}`);
        const alternativePathLength = pathDistances.get(`${source}_${transitNode}`) + pathDistances.get(`${transitNode}_${target}`);
        if (alternativePathLength < currentPathLength) {
          pathDistances.set(`${source}_${target}`, alternativePathLength);
        }
      }
    }
  }

  const finalMinimumCost = Array.from({ length: nodeCount }, (_, meetingPoint) => {
    const segmentS_M = pathDistances.get(`${startNodeIndex}_${meetingPoint}`);
    const segmentM_G1 = pathDistances.get(`${meetingPoint}_${goalOneIndex}`);
    const segmentM_G2 = pathDistances.get(`${meetingPoint}_${goalTwoIndex}`);
    return segmentS_M + segmentM_G1 + segmentM_G2;
  }).reduce((accumulator, currentPathSum) => Math.min(accumulator, currentPathSum), Infinity);

  console.log(finalMinimumCost);
});
