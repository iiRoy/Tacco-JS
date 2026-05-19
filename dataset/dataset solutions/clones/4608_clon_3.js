var inputReader = initializeInputReader();
processInput();

function readInteger(){
  return convertInput(readNextLine(), 1);
}

function readStringArray(){
  return convertInput(readNextLine(), 2);
}

function readIntegerArray(){
  return convertInput(readNextLine(), 4);
}

function readCharacterArray(){
  return convertInput(readNextLine(), 6);
}

function readNextLine(){
  return inputReader.readNext();
}

function hasMoreLines(){
  return inputReader.hasMore();
}

function readInputFile(){
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputReader(){
  const fileContentLines = readInputFile();
  let currentLineIndex = 0;
  const totalAvailableLines = fileContentLines.length;

  const inputHandler = {
    hasMore: () => currentLineIndex < totalAvailableLines,
    readNext: () => {
      if (!inputHandler.hasMore()) {
        return "";
      }
      const lineToReturn = fileContentLines[currentLineIndex];
      currentLineIndex++;
      return lineToReturn;
    }
  };
  return inputHandler;
}

function printOutput(data){
  console.log(data);
}

function printError(data){
  console.error(data);
}

function convertInput(inputValue, conversionType){
  const toNumeric = (val) => Number(val);

  try {
    if ((conversionType === 8 || conversionType === 9 || conversionType === 0) && !Array.isArray(inputValue)) {
        return inputValue;
    }

    switch(conversionType){
      case 1: return parseInt(inputValue, 10);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(toNumeric);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(toNumeric);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch(e){
    return inputValue;
  }
}

function calculateIntervalDuration(currentTimePoint, previousTimePoint, threshold) {
  const timeDifference = currentTimePoint - previousTimePoint;
  return Math.min(timeDifference, threshold);
}

function processInput(){
  const firstLineData = readIntegerArray();
  const numElements = firstLineData[0];
  const timeThreshold = firstLineData[1];
  const dataList = readIntegerArray();
  let totalDuration = 0;

  for(let idx = 1; idx < numElements; idx++){
    const currentTimePoint = dataList[idx];
    const previousTimePoint = dataList[idx-1];
    totalDuration += calculateIntervalDuration(currentTimePoint, previousTimePoint, timeThreshold);
  }

  totalDuration += timeThreshold;
  printOutput(totalDuration);
}
