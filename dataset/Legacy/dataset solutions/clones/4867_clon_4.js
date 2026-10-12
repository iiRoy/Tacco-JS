const obtainSource = () => require("fs").readFileSync("/dev/stdin", "utf8");

class InputProcessor {
  #lineBuffer;
  #currentPosition;

  constructor(rawContent) {
    this.#lineBuffer = rawContent.trim().split("\n");
    this.#currentPosition = 0;
  }

  retrieveNextLine() {
    if (!this.hasMoreLines()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    return this.#lineBuffer[this.#currentPosition++];
  }

  hasMoreLines() {
    return this.#currentPosition < this.#lineBuffer.length;
  }
}

const dataStream = new InputProcessor(obtainSource());

const fetchNext = () => dataStream.retrieveNextLine();
const checkNextAvailability = () => dataStream.hasMoreLines();

const typeConversionRegistry = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(" ")],
  [4, (val) => val.split(" ").map(Number)],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map(Number)],
  [8, (val) => val.join(" ")],
  [9, (val) => val.join("\n")],
  [0, (val) => val.join("")],
]);

const applyConversion = (valueToConvert, conversionKey) => {
  try {
    const converterFunction = typeConversionRegistry.get(conversionKey);
    return converterFunction ? converterFunction(valueToConvert) : valueToConvert;
  } catch (error) {
    return valueToConvert;
  }
};

function myout(text){console.log(text);}
function myerr(text){console.error(text);}

function executePathfinding() {
  const gridDimensions = applyConversion(fetchNext(), 4);
  const gridHeight = gridDimensions[0];
  const gridWidth = gridDimensions[1];

  const terrainMap = Array.from({ length: gridHeight }, () =>
    applyConversion(fetchNext(), 6)
  );

  const navigateGridRecursively = (currentY, currentX) => {
    if (currentY === 0 && currentX === 0) {
      return true; // Reached the starting point (0,0)
    }

    myerr(`${currentX} ${currentY}`); // Log current position to stderr

    let canMoveUp = false;
    let canMoveLeft = false;

    if (currentY > 0 && terrainMap[currentY - 1][currentX] === "#") {
      canMoveUp = true;
    }

    if (currentX > 0 && terrainMap[currentY][currentX - 1] === "#") {
      canMoveLeft = true;
    }

    // Apply movement rules based on original logic
    if (currentX === 0) { // On the leftmost column, must move up
      return canMoveUp && navigateGridRecursively(currentY - 1, currentX);
    }

    if (currentY === 0) { // On the topmost row, must move left
      return canMoveLeft && navigateGridRecursively(currentY, currentX - 1);
    }

    // Not on an edge: exactly one adjacent cell (up or left) must be '#'
    if (canMoveUp && !canMoveLeft) {
      return navigateGridRecursively(currentY - 1, currentX);
    } else if (!canMoveUp && canMoveLeft) {
      return navigateGridRecursively(currentY, currentX - 1);
    } else {
      return false; // Both '#' or both '.', or neither. Impossible path.
    }
  };

  const pathResult = navigateGridRecursively(gridHeight - 1, gridWidth - 1);

  if (pathResult) {
    myout("Possible");
  } else {
    myout("Impossible");
  }
}

executePathfinding();
