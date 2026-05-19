var inputHandler = initializeInputReader();
processGridData();

function getNextInt() {
  return dataConverter(inputHandler.next(), 1);
}

function getNextStrArray() {
  return dataConverter(inputHandler.next(), 2);
}

function getNextIntArray() {
  return dataConverter(inputHandler.next(), 4);
}

function getNextCharArray() {
  return dataConverter(inputHandler.next(), 6);
}

function getNextLine() {
  return inputHandler.next();
}

function hasMoreInput() {
  return inputHandler.hasNext();
}

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputReader() {
  const fileContent = readInputFile();
  const readerObject = {
    "lines": fileContent,
    "currentIndex": 0,
    "totalLines": fileContent.length,
    "hasNext": function() {
      return (this.currentIndex < this.totalLines);
    },
    "next": function() {
      if (!this.hasNext()) {
        return "";
      } else {
        const currentLine = this.lines[this.currentIndex];
        this.currentIndex++;
        return currentLine;
      }
    }
  };
  return readerObject;
}

function printOutput(message) {
  console.log(message);
}

function printError(message) {
  console.error(message);
}

function dataConverter(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((item) => Number(item));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((item) => Number(item));
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (error) {
    return inputVal;
  }
}

function countGridCharacters(gridHeight, gridWidth) {
  const characterCounts = {};
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    const currentRowChars = getNextCharArray();
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      const char = currentRowChars[colIdx];
      characterCounts[char] = (characterCounts[char] || 0) + 1;
    }
  }
  return characterCounts;
}

function calculateSymmetryCounts(gridHeight, gridWidth) {
  let quadCount = 0;
  let pairCount = 0;
  let singleCount = 0;

  const halfHeight = Math.ceil(gridHeight / 2);
  const halfWidth = Math.ceil(gridWidth / 2);

  printError(`Hhalf : ${halfHeight}`);
  printError(`Whalf : ${halfWidth}`);

  const isHeightOdd = (gridHeight % 2 === 1);
  const isWidthOdd = (gridWidth % 2 === 1);

  if (isHeightOdd && isWidthOdd) {
    quadCount = (halfHeight - 1) * (halfWidth - 1);
    pairCount = (halfHeight - 1) + (halfWidth - 1);
    singleCount = 1;
  } else if (isHeightOdd && !isWidthOdd) {
    quadCount = halfWidth * (halfHeight - 1);
    pairCount = halfWidth;
  } else if (!isHeightOdd && isWidthOdd) {
    quadCount = halfHeight * (halfWidth - 1);
    pairCount = halfHeight;
  } else {
    quadCount = halfHeight * halfWidth;
  }

  return { quadCount, pairCount, singleCount };
}

function consumeRequiredCharacters(requiredMultiple, requiredQuantity, charCounts, uniqueChars) {
  let currentRequired = requiredQuantity;
  while (currentRequired > 0) {
    let foundMatchInIteration = false;
    for (const charKey of uniqueChars) {
      if (charCounts[charKey] >= requiredMultiple) {
        charCounts[charKey] -= requiredMultiple;
        currentRequired--;
        foundMatchInIteration = true;
        break;
      }
    }
    if (!foundMatchInIteration) {
      return false;
    }
  }
  return true;
}

function processGridData() {
  const dimensionsInput = getNextIntArray();
  const gridHeight = dimensionsInput[0];
  const gridWidth = dimensionsInput[1];

  const charCounts = countGridCharacters(gridHeight, gridWidth);
  const { quadCount, pairCount, singleCount } = calculateSymmetryCounts(gridHeight, gridWidth);

  const uniqueChars = Object.keys(charCounts);

  if (!consumeRequiredCharacters(4, quadCount, charCounts, uniqueChars)) {
    printOutput("No");
    return;
  }

  if (!consumeRequiredCharacters(2, pairCount, charCounts, uniqueChars)) {
    printOutput("No");
    return;
  }

  if (!consumeRequiredCharacters(1, singleCount, charCounts, uniqueChars)) {
    printOutput("No");
    return;
  }

  printOutput("Yes");
}
