const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let inputProcessorInstance;
const rawInputLines = [];
inputReader.on('line', (line) => { rawInputLines.push(line); });
inputReader.on('close', () => {
  inputProcessorInstance = initializeInputProcessor(rawInputLines);
  console.error("\n");
  const startTime = Date.now();
  executeCalculation();
  const endTime = Date.now() - startTime;
  logError("execution_time : " + (endTime) + "ms");
  logError("memory_usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
const createDeepCopy = (data) => JSON.parse(JSON.stringify(data));
const retrieveNextInteger = () => convertInput(retrieveNextLine(), 1);
const retrieveNextStringArray = () => convertInput(retrieveNextLine(), 2);
const retrieveNextIntegerArray = () => convertInput(retrieveNextLine(), 4);
const retrieveNextCharacterArray = () => convertInput(retrieveNextLine(), 6);
const retrieveNextLine = () => inputProcessorInstance.retrieveNext();
const hasMoreLines = () => inputProcessorInstance.hasMoreLines();
const initializeInputProcessor = (lines) => {  
  const processor = {
    lineList : lines,
    currentLineIndex : 0,
    maximumLines : lines.length,
    hasMoreLines : function(){ return (this.currentLineIndex < this.maximumLines); },
    retrieveNext : function(){
      if(!this.hasMoreLines()){ throw "EndOfInputException: No more lines to process"; }
      else {
        const currentInputLine = this.lineList[this.currentLineIndex];
        this.currentLineIndex++;
        return currentInputLine;
      }
    }
  };
  return processor;
};
const outputResult = (content) => { console.log(content); };
const logError = (info) => { console.error("diagnostic:" + require("util").inspect(info,false,null)); };
const convertInput = (data, formatCode) => {
  try {
    switch(formatCode){
      case 1: return parseInt(data);
      case 2: return data.split(" ");
      case 4: return data.split(" ").map(Number);
      case 6: return data.split("");
      case 7: return data.split("").map(Number);
      case 8: return data.join(" ");
      case 9: return data.join("\n");
      case 0: return data.join("");
      default: return data;
    }
  } catch(e) {
    return data;
  }
};

const executeCalculation = () => {
  const totalElements = retrieveNextInteger();
  
  const allIncomingNumbers = Array.from({ length: totalElements }, () => retrieveNextInteger());

  const finalSequenceTails = allIncomingNumbers.reduce((currentTailValues, incomingValue) => {
    if (currentTailValues.length === 0 || incomingValue > currentTailValues[currentTailValues.length - 1]) {
      return [...currentTailValues, incomingValue];
    } else {
      const replacementPosition = findAppropriatePosition(currentTailValues, incomingValue);
      return [
        ...currentTailValues.slice(0, replacementPosition),
        incomingValue,
        ...currentTailValues.slice(replacementPosition + 1)
      ];
    }
  }, []);

  outputResult(finalSequenceTails.length);
};

const findAppropriatePosition = (sortedCollection, targetEntry, leftBoundary = 0, rightBoundary = sortedCollection.length) => {
  if (leftBoundary >= rightBoundary) {
    return leftBoundary;
  }

  const middlePoint = Math.floor((leftBoundary + rightBoundary) / 2);

  if (sortedCollection[middlePoint] < targetEntry) {
    return findAppropriatePosition(sortedCollection, targetEntry, middlePoint + 1, rightBoundary);
  } else {
    return findAppropriatePosition(sortedCollection, targetEntry, leftBoundary, middlePoint);
  }
};