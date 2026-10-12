class DataStreamProcessor {
  #mutableLines;
  #currentLinePointer;

  constructor(inputString) {
    this.#mutableLines = inputString.split("\n");
    this.#currentLinePointer = 0;
  }

  extractValue(asString = false) {
    if (this.#currentLinePointer >= this.#mutableLines.length) {
      return undefined;
    }

    let currentLineEntry = this.#mutableLines[this.#currentLinePointer];

    if (typeof currentLineEntry === "string") {
      this.#mutableLines[this.#currentLinePointer] = currentLineEntry.split(" ").reverse();
      currentLineEntry = this.#mutableLines[this.#currentLinePointer];
    }

    const extracted = currentLineEntry.pop();

    if (currentLineEntry.length === 0) {
      this.#currentLinePointer++;
    }

    return asString ? extracted : Number(extracted);
  }

  retrieveLine(asStrings = false) {
    if (this.#currentLinePointer >= this.#mutableLines.length) {
      return [];
    }

    const lineContent = this.#mutableLines[this.#currentLinePointer];
    this.#currentLinePointer++;

    const parts = lineContent.split(" ");
    return asStrings ? parts : parts.map(Number);
  }

  fetchMatrix(rowCount, asStrings = false) {
    const resultMatrix = Array.from({ length: rowCount }, () => {
      if (this.#currentLinePointer >= this.#mutableLines.length) {
        return [];
      }
      const lineContent = this.#mutableLines[this.#currentLinePointer];
      this.#currentLinePointer++;

      const parts = lineContent.split(" ");
      return asStrings ? parts : parts.map(Number);
    });
    return resultMatrix;
  }
}

const coordinateProcessor = () => {
  const inputSource = new DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

  const pointCount = inputSource.extractValue();
  const coordinatePairs = inputSource.fetchMatrix(pointCount);

  const getParity = (val) => ((val % 2) + 2) % 2;

  const initialSumParity = getParity(coordinatePairs[0][0] + coordinatePairs[0][1]);

  const allParitiesMatch = coordinatePairs.every((pair) => {
    return getParity(pair[0] + pair[1]) === initialSumParity;
  });

  if (!allParitiesMatch) {
    return -1;
  }

  const stepCount = 20 - initialSumParity;
  const stepMagnitudes = Array(stepCount).fill(1);

  const pathTraces = coordinatePairs.map((initialPair) => {
    const finalState = Array.from({ length: stepCount }).reduce((state, _currentValue, _index) => {
      let nextX = state.x;
      let nextY = state.y;
      let moveChar = "";

      if (nextX > 0) {
        nextX--;
        moveChar = "R";
      } else if (nextX < 0) {
        nextX++;
        moveChar = "L";
      } else if (nextY > 0) {
        nextY--;
        moveChar = "U";
      } else {
        nextY++;
        moveChar = "D";
      }
      return { x: nextX, y: nextY, path: state.path + moveChar };
    }, { x: initialPair[0], y: initialPair[1], path: "" });

    return finalState.path;
  });

  return `${stepCount}\n${stepMagnitudes.join(" ")}\n${pathTraces.join("\n")}`;
};

console.log(coordinateProcessor());
