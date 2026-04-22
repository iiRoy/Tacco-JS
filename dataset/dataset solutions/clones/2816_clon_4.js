const processGraphData = (inputSource) => {
  const inputLines = inputSource.split('\n');
  const parameters = inputLines[0].split(' ');

  const nodeCount = parseInt(parameters[0], 10);
  const desiredK = parseInt(parameters[1], 10);

  if (nodeCount <= 2) {
    process.stdout.write('-1\n');
    return;
  }

  const maximumPossibleK = (nodeCount - 1) * (nodeCount - 2) / 2;

  if (nodeCount > maximumPossibleK) {
    process.stdout.write('-1\n');
    return;
  }

  if (desiredK > maximumPossibleK) {
    process.stdout.write('-1\n');
    return;
  }

  const connectionStrings = [];
  let totalConnections = 0;

  for (let currentVertex = 2; currentVertex <= nodeCount; ++currentVertex) {
    connectionStrings.push(`${1} ${currentVertex}`);
    totalConnections++;
  }

  const pairsToEliminate = maximumPossibleK - desiredK;

  for (let i = 0; i < pairsToEliminate; ++i) {
    const v1 = i + 2;
    const v2 = i + 3;
    connectionStrings.push(`${v1} ${v2}`);
    totalConnections++;
  }

  const finalOutput = `${totalConnections}\n${connectionStrings.join('\n')}\n`;
  process.stdout.write(finalOutput);
};

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));