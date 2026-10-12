const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
const rawDataLines = fileContent.split("\n");

const createInputReader = (linesArray) => {
  let currentLineIndex = 0;
  const totalAvailableLines = linesArray.length;

  const getNextElement = () => {
    if (!hasMoreElements()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const returnedElement = linesArray[currentLineIndex];
    currentLineIndex++;
    return returnedElement;
  };

  const hasMoreElements = () => {
    return currentLineIndex < totalAvailableLines;
  };

  return {
    fetchNext: getNextElement,
    hasMore: hasMoreElements,
  };
};

const dataStream = createInputReader(rawDataLines);

function getNextLine() {
  return dataStream.fetchNext();
}

function checkMoreLines() {
  return dataStream.hasMore();
}

function printOutput(message) {
  console.log(message);
}

function printError(message) {
  console.error(message);
}

const conversionStrategies = new Map();
conversionStrategies.set(1, (val) => parseInt(val));
conversionStrategies.set(2, (val) => val.split(" "));
conversionStrategies.set(4, (val) => val.split(" ").map((item) => Number(item)));
conversionStrategies.set(6, (val) => val.split(""));
conversionStrategies.set(7, (val) => val.split("").map((item) => Number(item)));
conversionStrategies.set(8, (val) => val.join(" "));
conversionStrategies.set(9, (val) => val.join("\n"));
conversionStrategies.set(0, (val) => val.join(""));

function transformInput(inputValue, conversionType) {
  try {
    const strategy = conversionStrategies.get(conversionType);
    if (strategy) {
      return strategy(inputValue);
    }
    return inputValue;
  } catch (e) {
    return inputValue;
  }
}

executeMainLogic();

function executeMainLogic() {
  let inputString = getNextLine();
  const ALPHABET_FULL_STRING = "abcdefghijklmnopqrstuvwxyz";

  if (inputString.length < 26) {
    const alphabetCharacterList = transformInput(ALPHABET_FULL_STRING, 6);
    const mutableWorkingAlphabet = [...alphabetCharacterList];

    for (let idx = 0; idx < inputString.length; idx++) {
      const charToMark = inputString[idx];
      const charIndex = mutableWorkingAlphabet.indexOf(charToMark);
      if (charIndex !== -1) {
        mutableWorkingAlphabet[charIndex] = "";
      }
    }

    printError(mutableWorkingAlphabet);

    let charToAppend = null;
    for (let idx = 0; idx < mutableWorkingAlphabet.length; idx++) {
      if (mutableWorkingAlphabet[idx] !== "") {
        charToAppend = mutableWorkingAlphabet[idx];
        break;
      }
    }

    if (charToAppend !== null) {
      inputString += charToAppend;
    }
    printOutput(inputString);
  } else {
    if (inputString === "zyxwvutsrqponmlkjihgfedcba") {
      printOutput(-1);
    } else {
      // Original code had an empty else block here, preserving this behavior.
    }
  }
}
