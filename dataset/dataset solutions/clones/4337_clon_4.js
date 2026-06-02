class InputHandler {
  #inputLines;
  #currentLinePosition;

  constructor() {
    this.#inputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    this.#currentLinePosition = 0;
  }

  fetchNextLine() {
    if (this.#currentLinePosition >= this.#inputLines.length) {
      return "";
    }
    return this.#inputLines[this.#currentLinePosition++];
  }

  static transformContent(contentValue, transformationType) {
    try {
      switch (transformationType) {
        case 1: return parseInt(contentValue, 10);
        case 2: return contentValue.split(" ");
        case 4: return contentValue.split(" ").map(Number);
        case 6: return contentValue.split("");
        case 7: return contentValue.split("").map(Number);
        case 8: return contentValue.join(" ");
        case 9: return contentValue.join("\n");
        case 0: return contentValue.join("");
        default: return contentValue;
      }
    } catch (e) {
      return contentValue;
    }
  }
}

const inputSource = new InputHandler();

function retrieveNextInteger() {
  return InputHandler.transformContent(inputSource.fetchNextLine(), 1);
}

function retrieveNextCharacterArray() {
  return InputHandler.transformContent(inputSource.fetchNextLine(), 6);
}

function retrieveNextIntegerArray() {
  return InputHandler.transformContent(inputSource.fetchNextLine(), 4);
}

function outputResult(message) {
  console.log(message);
}

function outputDebug(message) {
  console.error(message);
}

function solveSymmetryPuzzle() {
  const gridDimensions = retrieveNextIntegerArray();
  const gridHeight = gridDimensions[0];
  const gridWidth = gridDimensions[1];

  const characterCounts = new Map();
  Array.from({ length: gridHeight }).forEach(() => {
    const rowCharacters = retrieveNextCharacterArray();
    rowCharacters.forEach(charKey => {
      characterCounts.set(charKey, (characterCounts.get(charKey) || 0) + 1);
    });
  });

  let requiredQuads = 0;
  let requiredPairs = 0;
  let requiredSingles = 0;

  const halfGridHeight = Math.ceil(gridHeight / 2);
  const halfGridWidth = Math.ceil(gridWidth / 2);

  outputDebug("halfHeight : " + halfGridHeight);
  outputDebug("halfWidth : " + halfGridWidth);

  const isHeightOdd = gridHeight % 2 === 1;
  const isWidthOdd = gridWidth % 2 === 1;

  if (isHeightOdd && isWidthOdd) {
    requiredQuads = (halfGridHeight - 1) * (halfGridWidth - 1);
    requiredPairs = (halfGridHeight - 1) + (halfGridWidth - 1);
    requiredSingles = 1;
  } else if (isHeightOdd && !isWidthOdd) {
    requiredQuads = halfGridWidth * (halfGridHeight - 1);
    requiredPairs = halfGridWidth;
  } else if (!isHeightOdd && isWidthOdd) {
    requiredQuads = halfGridHeight * (halfGridWidth - 1);
    requiredPairs = halfGridHeight;
  } else {
    requiredQuads = halfGridHeight * halfGridWidth;
  }

  const consumptionOrder = [
    { unitSize: 4, quantity: requiredQuads },
    { unitSize: 2, quantity: requiredPairs },
    { unitSize: 1, quantity: requiredSingles }
  ];

  const canConstruct = consumptionOrder.every(requirement => {
    let currentQuantity = requirement.quantity;
    const currentUnitSize = requirement.unitSize;

    while (currentQuantity > 0) {
      let foundConsumableChar = false;
      for (const [charIdentifier, charFrequency] of characterCounts.entries()) {
        if (charFrequency >= currentUnitSize) {
          characterCounts.set(charIdentifier, charFrequency - currentUnitSize);
          currentQuantity--;
          foundConsumableChar = true;
          break;
        }
      }
      if (!foundConsumableChar) {
        return false;
      }
    }
    return true;
  });

  outputResult(canConstruct ? "Yes" : "No");
}

solveSymmetryPuzzle();
