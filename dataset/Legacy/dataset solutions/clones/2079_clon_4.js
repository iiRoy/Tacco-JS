const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let rawInputLines = [];
let lineIteratorInstance;
let peekedLineResult;

inputReader.on('line', function(inputLine){rawInputLines.push(inputLine);});
inputReader.on('close', function(){
  lineIteratorInstance = createLineIterator(rawInputLines);
  console.error("\n");
  const startTime = Date.now();
  executeMainLogic();
  const endTime = Date.now() - startTime;
  logDebug("time : " + (endTime) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

const deepCopy = (source) => JSON.parse(JSON.stringify(source));

function* createLineIterator(linesCollection) {
  for (const currentLine of linesCollection) {
    yield currentLine;
  }
}

function getLine() {
  if (peekedLineResult && !peekedLineResult.done) {
    const value = peekedLineResult.value;
    peekedLineResult = undefined;
    return value;
  }
  const result = lineIteratorInstance.next();
  if (result.done) {
    throw "ArrayIndexOutOfBoundsException ‚There is no more input";
  }
  return result.value;
}

function hasMoreLines() {
  if (!peekedLineResult) {
    peekedLineResult = lineIteratorInstance.next();
  }
  return !peekedLineResult.done;
}

const dataTransformers = {
  1: (val) => parseInt(val),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (val) => val.join(" "),
  9: (val) => val.join("\n"),
  0: (val) => val.join(""),
};

function transformData(inputVal, transformType) {
  try {
    const transformer = dataTransformers[transformType];
    return transformer ? transformer(inputVal) : inputVal;
  } catch (e) {
    return inputVal;
  }
}

function getInteger(){return transformData(getLine(),1);}
function getStringArray(){return transformData(getLine(),2);}
function getIntegerArray(){return transformData(getLine(),4);}
function getCharacterArray(){return transformData(getLine(),6);}

function printResult(data){console.log(data);}
function logDebug(message){console.error("debug:" + require("util").inspect(message, { showHidden: false, depth: null }));}

function executeMainLogic(){
  const outputSequence = ["aaa", "aab", "aba", "abb", "abc"];
  outputSequence.forEach(item => printResult(item));
}
