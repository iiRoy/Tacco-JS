const readInputFromFile = () => require("fs").readFileSync("/dev/stdin", "utf8");

const createInputReader = (rawInputString) => {
  const dataLines = rawInputString.trim().split("\n");
  let currentLineIndex = 0;
  const totalLines = dataLines.length;

  const hasMoreLines = () => currentLineIndex < totalLines;

  const getNextLine = () => {
    if (!hasMoreLines()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const currentLineContent = dataLines[currentLineIndex];
    currentLineIndex++;
    return currentLineContent;
  };

  return {
    hasMoreLines,
    getNextLine,
  };
};

const inputReader = createInputReader(readInputFromFile());

const fetchNextLine = () => inputReader.getNextLine();
const fetchNextInteger = () => dataConverter(fetchNextLine(), 1);
const fetchNextStringArray = () => dataConverter(fetchNextLine(), 2);
const fetchNextIntegerArray = () => dataConverter(fetchNextLine(), 4);
const fetchNextCharacterArray = () => dataConverter(fetchNextLine(), 6);
const hasMoreInput = () => inputReader.hasMoreLines();

const printToStdout = (outputValue) => console.log(outputValue);
const printToStderr = (errorValue) => console.error(errorValue);

const dataConverter = (inputValue, conversionType) => {
  try {
    const conversionOperations = {
      1: (val) => Number.parseInt(val, 10),
      2: (val) => val.split(" "),
      4: (val) => val.split(" ").map(Number),
      6: (val) => val.split(""),
      7: (val) => val.split("").map(Number),
      8: (val) => val.join(" "),
      9: (val) => val.join("\n"),
      0: (val) => val.join(""),
    };

    const converterFunction = conversionOperations[conversionType];
    if (converterFunction) {
      return converterFunction(inputValue);
    } else {
      return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
};

const executeMainLogic = () => {
  const arraySize = fetchNextInteger();
  const listA = fetchNextIntegerArray();
  const listB = fetchNextIntegerArray();

  let balanceCounter = 0;

  for (let idx = 0; idx < arraySize; idx++) {
    const valueA = listA[idx];
    const valueB = listB[idx];

    if (valueA < valueB) {
      const differenceCalculation = valueB - (valueA / 2);
      balanceCounter += Math.floor(differenceCalculation);
    } else if (valueA > valueB) {
      balanceCounter -= (valueA - valueB);
    }
  }

  if (balanceCounter >= 0) {
    printToStdout("Yes");
  } else {
    printToStdout("No");
  }
};

executeMainLogic();
