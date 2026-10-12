let inputSource;

function readRawInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function prepareInputReader() {
  const rawLines = readRawInput();
  return {
    lineData: rawLines,
    currentIndex: 0,
    totalLines: rawLines.length,
    hasMoreLines: function() {
      return (this.currentIndex < this.totalLines);
    },
    fetchNextLine: function() {
      if (!this.hasMoreLines()) {
        throw "InputExhaustedException: No more lines available.";
      } else {
        const currentLine = this.lineData[this.currentIndex];
        this.currentIndex++;
        return currentLine;
      }
    }
  };
}

inputSource = prepareInputReader();

function getNextInteger() {
  return applyConversion(fetchNextLine(), 1);
}

function getNextStringArray() {
  return applyConversion(fetchNextLine(), 2);
}

function getNextIntegerArray() {
  return applyConversion(fetchNextLine(), 4);
}

function getNextCharacterArray() {
  return applyConversion(fetchNextLine(), 6);
}

function fetchNextLine() {
  return inputSource.fetchNextLine();
}

function hasMoreLines() {
  return inputSource.hasMoreLines();
}

function emitResult(content) {
  console.log(content);
}

function emitError(content) {
  console.error(content);
}

const conversionDispatch = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(" ")],
  [4, (val) => val.split(" ").map(Number)],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map(Number)],
  [8, (val) => val.join(" ")],
  [9, (val) => val.join("\n")],
  [0, (val) => val.join("")],
]);

function applyConversion(inputValue, conversionType) {
  try {
    const converter = conversionDispatch.get(conversionType);
    return converter ? converter(inputValue) : inputValue;
  } catch (e) {
    return inputValue;
  }
}

function ProcessInput() {
  const inputString = fetchNextLine();
  const characterArray = Array.from(inputString);

  const finalScore = characterArray.reduce((currentTally, charElement, charIdx) => {
    const isEvenPosition = charIdx % 2 === 0;
    const isNotLastPosition = charIdx < characterArray.length - 1;

    const scoreChange = (
      (isEvenPosition && isNotLastPosition && charElement === 'g') ? 1 :
      (!(isEvenPosition && isNotLastPosition) && charElement === 'p') ? -1 :
      0
    );

    return currentTally + scoreChange;
  }, 0);

  emitResult(finalScore);
}

ProcessInput();
