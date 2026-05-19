const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputProcessor;
const rawInputLines = [];

inputReader.on('line', (inputLine) => { rawInputLines.push(inputLine); });
inputReader.on('close', () => {
  inputProcessor = setupInputProcessor(rawInputLines);
  console.error('\n↑入力 ↓出力');
  executeSolution();
});

function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function readInteger() { return processInputToken(fetchNextToken(), 1); }
function readStringArray() { return processInputToken(fetchNextToken(), 2); }
function readIntegerArray() { return processInputToken(fetchNextToken(), 4); }
function readCharacterArray() { return processInputToken(fetchNextToken(), 6); }
function fetchNextToken() { return inputProcessor.fetchNext(); }
function hasMoreTokens() { return inputProcessor.hasMore(); }

function setupInputProcessor(lines) {
  let currentIndex = 0;
  const maxLines = lines.length;

  return {
    hasMore: () => currentIndex < maxLines,
    fetchNext: () => {
      if (currentIndex < maxLines) {
        return lines[currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function processInputToken(token, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(token, 10);
      case 2: return token.split(' ');
      case 4: return token.split(' ').map(Number);
      case 6: return token.split('');
      case 7: return token.split('').map(Number);
      case 8: return token.join(' ');
      case 9: return token.join('\n');
      case 0: return token.join('');
      default: return token;
    }
  } catch (e) {
    return token;
  }
}

function outputResult(data) { console.log(data); }
function outputDebug(data) { console.error('debug:' + require('util').inspect(data, false, null)); }

function executeSolution() {
  const [nodeCount, maxColors] = readIntegerArray();

  const graphStructure = Array.from({ length: nodeCount }, (_, i) => ({
    adjacentNodes: [],
    nodeIdentifier: i,
    assignedColorCount: 0,
    isNodeVisited: false
  }));

  for (let i = 0; i < nodeCount - 1; i++) {
    const [u, v] = readIntegerArray();
    graphStructure[u - 1].adjacentNodes.push(v - 1);
    graphStructure[v - 1].adjacentNodes.push(u - 1);
  }

  let finalProduct = 1;
  const modulusValue = 1000000007;

  const multiplyAndModulo = (val1, val2, mod) => (BigInt(val1) * BigInt(val2)) % BigInt(mod);

  graphStructure[0].isNodeVisited = true;

  const traversalStack = [[0, maxColors, 0]];

  while (traversalStack.length > 0) {
    const [parentColorUsage, currentAvailableColors, currentNodeIdx] = traversalStack.pop();

    graphStructure[currentNodeIdx].assignedColorCount = currentAvailableColors;

    const effectiveParentColorUsage = parentColorUsage < 2 ? parentColorUsage + 1 : parentColorUsage;

    let processedChildrenCount = 0;
    const neighbors = graphStructure[currentNodeIdx].adjacentNodes;

    for (let i = 0; i < neighbors.length; i++) {
      const neighborIdx = neighbors[i];
      if (!graphStructure[neighborIdx].isNodeVisited) {
        graphStructure[neighborIdx].isNodeVisited = true;
        const childAvailableColors = maxColors - processedChildrenCount - effectiveParentColorUsage;
        traversalStack.push([effectiveParentColorUsage, childAvailableColors, neighborIdx]);
        processedChildrenCount++;
      }
    }
  }

  for (let i = 0; i < nodeCount; i++) {
    finalProduct = multiplyAndModulo(finalProduct, graphStructure[i].assignedColorCount, modulusValue);
    if (finalProduct === 0) {
      break;
    }
  }

  outputResult(finalProduct);
}
