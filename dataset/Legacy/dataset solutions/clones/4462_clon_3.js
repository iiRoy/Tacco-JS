var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

function createDataIterator(sourceLines) {
  let currentIdx = 0;
  const dataLength = sourceLines.length;

  const canAdvance = () => currentIdx < dataLength;

  const retrieveNext = () => {
    if (!canAdvance()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const currentItem = sourceLines[currentIdx];
    currentIdx++;
    return currentItem;
  };

  const peekNext = () => {
    if (!canAdvance()) {
      return undefined;
    }
    return sourceLines[currentIdx];
  };

  const resetIterator = () => {
    currentIdx = 0;
  };

  return {
    canAdvance,
    retrieveNext,
    peekNext,
    resetIterator
  };
}

var dataIterator = createDataIterator(rawData);

function getNextItem(){return dataIterator.retrieveNext();}
function getNextInt(){return dataConverter(getNextItem(),1);}
function getNextStrArr(){return dataConverter(getNextItem(),2);}
function getNextIntArr(){return dataConverter(getNextItem(),4);}
function getNextCharArr(){return dataConverter(getNextItem(),6);}
function hasMoreData(){return dataIterator.canAdvance();}

function printOutput(val){console.log(val);}
function printError(val){console.error(val);}

const convertToNumber = (str) => Number(str);

function dataConverter(inputVal, conversionType){
  try{
    let splitResult;

    switch(conversionType){
      case 1: return parseInt(inputVal);
      case 2:
        splitResult = inputVal.split(" ");
        return splitResult;
      case 4:
        splitResult = inputVal.split(" ");
        return splitResult.map(convertToNumber);
      case 6:
        splitResult = inputVal.split("");
        return splitResult;
      case 7:
        splitResult = inputVal.split("");
        return splitResult.map(convertToNumber);
      case 8: return inputVal.join(" ");
      case 9: return inputVal.join("\n");
      case 0: return inputVal.join("");
      default: return inputVal;
    }
  }catch(e){
    return inputVal;
  }
}

function processEdges(numEdges, targetN, getNextIntArrFunc) {
  const pathsFromStart = new Set();
  const pathsToEnd = new Set();
  const START_NODE_VAL = 1;

  for (let k = 0; k < numEdges; k++) {
    const edgeData = getNextIntArrFunc();
    const [startNode, endNode] = edgeData;

    if (startNode === START_NODE_VAL) {
      pathsFromStart.add(endNode);
    }
    if (endNode === targetN) {
      pathsToEnd.add(startNode);
    }
  }
  return { pathsFromStart, pathsToEnd };
}

function executeLogic(){
  const firstLineData = getNextIntArr();
  const [targetN, numEdges] = firstLineData;

  if (numEdges === 0) {
    printOutput("IMPOSSIBLE");
    return;
  }

  const { pathsFromStart, pathsToEnd } = processEdges(numEdges, targetN, getNextIntArr);

  printError(pathsFromStart);
  printError(pathsToEnd);

  const possibleFound = Array.from(pathsToEnd).some(node => pathsFromStart.has(node));

  if (possibleFound) {
    printOutput("POSSIBLE");
  } else {
    printOutput("IMPOSSIBLE");
  }
}

executeLogic();
