var inputInterface = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var bufferedLines = [];
var inputLineIterator;

inputInterface.on('line', function(inputLine){bufferedLines.push(inputLine);});
inputInterface.on('close', function(){
  inputLineIterator = createLineIterator(bufferedLines);
  console.error('\n↑入力 ↓出力');
  processTetrominoCounts();
});

function replicateObject(sourceObj){return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));}

function* createLineIterator(lines) {
  for (const line of lines) {
    yield line;
  }
}

function retrieveNextLine(){
  const { value, done } = inputLineIterator.next();
  if (done) {
    throw new Error('Input exhausted');
  }
  return value;
}

const inputTransformers = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(' ')],
  [4, (val) => val.split(' ').map(Number)],
  [6, (val) => val.split('')],
  [7, (val) => val.split('').map(Number)],
  [8, (val) => val.join(' ')],
  [9, (val) => val.join('\n')],
  [0, (val) => val.join('')],
]);

function transformInput(item, typeIdentifier) {
  try {
    const transformer = inputTransformers.get(typeIdentifier);
    return transformer ? transformer(item) : item;
  } catch (err) {
    return item;
  }
}

function outputResult(data){console.log(data);}
function logDebugError(message){console.error('debug:' + require('util').inspect(message,false,null));}

function processTetrominoCounts(){
  const countsRaw = retrieveNextLine();
  const pieceQuantities = transformInput(countsRaw, 4);

  const quantityI = pieceQuantities[0];
  const quantityO = pieceQuantities[1];
  const quantityT = pieceQuantities[2];
  const quantityJ = pieceQuantities[3];
  const quantityL = pieceQuantities[4];
  const quantityS = pieceQuantities[5];
  const quantityZ = pieceQuantities[6];

  const getLargestEvenOrZero = (num) => num & ~1;

  const scenarioOneBlocks = getLargestEvenOrZero(quantityI) +
                            getLargestEvenOrZero(quantityJ) +
                            getLargestEvenOrZero(quantityL);

  const scenarioTwoBlocks = getLargestEvenOrZero(quantityI - 1) +
                            getLargestEvenOrZero(quantityJ - 1) +
                            getLargestEvenOrZero(quantityL - 1) + 6;

  let maximumUsableBlocks = scenarioOneBlocks;
  if (scenarioTwoBlocks > maximumUsableBlocks) {
    maximumUsableBlocks = scenarioTwoBlocks;
  }

  outputResult(maximumUsableBlocks + quantityO);
}
