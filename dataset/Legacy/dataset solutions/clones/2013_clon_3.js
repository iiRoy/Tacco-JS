var inputHandler = initializeInputProcessor();

executePrimaryLogic();

function readNextInteger() { return convertInputData(getNextInputLine(), 1); }
function readNextStringArray() { return convertInputData(getNextInputLine(), 2); }
function readNextIntegerArray() { return convertInputData(getNextInputLine(), 4); }
function readNextCharacterArray() { return convertInputData(getNextInputLine(), 6); }

function getNextInputLine() { return inputHandler.getNext(); }
function hasMoreInput() { return inputHandler.hasMore(); }

function readInputFileContent() { return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"); }

function initializeInputProcessor() {
  const rawInputLines = readInputFileContent();
  let currentIndex = 0;
  const maxLines = rawInputLines.length;

  const checkMoreInput = function() {
    return (currentIndex < maxLines);
  };

  const retrieveNextLine = function() {
    if (!checkMoreInput()) {
      throw "ArrayIndexOutOfBoundsException: No more input available.";
    }
    const currentInputLine = rawInputLines[currentIndex];
    currentIndex++;
    return currentInputLine;
  };

  const inputProcessorInstance = {
    "hasMore": checkMoreInput,
    "getNext": retrieveNextLine
  };

  return inputProcessorInstance;
}

function printToStandardOutput(outputContent) { console.log(outputContent); }
function printToStandardError(errorContent) { console.error(errorContent); }

function convertInputData(inputValue, conversionType) {
  if (inputValue === null || inputValue === undefined) {
    return inputValue;
  }
  try {
    switch (conversionType) {
      case 1: return Number.parseInt(inputValue, 10);
      case 2: return inputValue.split(" ");
      case 4:
        const splitNumbers = inputValue.split(" ");
        return splitNumbers.map((item) => Number(item));
      case 6: return inputValue.split("");
      case 7:
        const splitChars = inputValue.split("");
        return splitChars.map((item) => Number(item));
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function executePrimaryLogic() {
  const inputNumber = readNextInteger();

  const targetForDivisors = inputNumber - 1;
  const divisorCollection = retrieveDivisorList(targetForDivisors);
  const finalResult = divisorCollection.length + 1;

  printToStandardOutput(finalResult);
}

function retrieveDivisorList(targetValue) {
  const divisorCollection = [];
  for (let currentDivisorCandidate = 1; currentDivisorCandidate * currentDivisorCandidate <= targetValue; currentDivisorCandidate++) {
    if (targetValue % currentDivisorCandidate === 0) {
      divisorCollection.push(currentDivisorCandidate);
      const complementaryDivisor = targetValue / currentDivisorCandidate;
      if (currentDivisorCandidate * currentDivisorCandidate !== targetValue) {
        divisorCollection.push(complementaryDivisor);
      }
    }
  }
  divisorCollection.sort((valA, valB) => {
    return valA - valB;
  });
  return divisorCollection;
}
