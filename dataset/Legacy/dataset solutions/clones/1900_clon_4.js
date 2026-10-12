const processInputData = (sourceContent) => {
  const contentLines = sourceContent.trim().split('\n');
  const [totalNodesStr, totalEdgesStr] = contentLines[0].split(' ');
  const totalNodes = Number(totalNodesStr);
  const totalEdges = Number(totalEdgesStr);

  const nodeStrengths = new Map();
  contentLines[1].split(' ').map(Number).forEach((strengthValue, idx) => {
    nodeStrengths.set(idx + 1, strengthValue);
  });

  const competitionPairs = contentLines.slice(2).map(line =>
    line.split(' ').map(Number)
  );

  return { totalNodes, totalEdges, nodeStrengths, competitionPairs };
};

const determineDominantNodes = ({ totalNodes, nodeStrengths, competitionPairs }) => {
  const eliminatedNodes = new Set();

  competitionPairs.forEach(([nodeOne, nodeTwo]) => {
    const strengthOne = nodeStrengths.get(nodeOne);
    const strengthTwo = nodeStrengths.get(nodeTwo);

    if (strengthOne <= strengthTwo) {
      eliminatedNodes.add(nodeOne);
    }
    if (strengthTwo <= strengthOne) {
      eliminatedNodes.add(nodeTwo);
    }
  });

  return totalNodes - eliminatedNodes.size;
};

const runApplication = (inputPayload) => {
  const parsedData = processInputData(inputPayload);
  const dominantCount = determineDominantNodes(parsedData);
  console.log(dominantCount);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : runApplication(require('fs').readFileSync('dev/stdin', 'utf8')))
  : runApplication(require('fs').readFileSync('/dev/stdin', 'utf8'));
