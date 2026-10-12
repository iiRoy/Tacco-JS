class InputProcessor {
  constructor(inputString) {
    this._sourceLines = inputString.split("\n");
    this._currentLineIndex = 0;
  }

  readNextAtom(asStringFlag) {
    const lines = this._sourceLines;
    const lineIndex = this._currentLineIndex;

    if (typeof lines[lineIndex] === "string") {
      lines[lineIndex] = lines[lineIndex].split(" ").reverse();
    }

    const atomValue = lines[lineIndex].pop();

    if (lines[lineIndex].length === 0) {
      this._currentLineIndex++;
    }
    return asStringFlag ? atomValue : Number(atomValue);
  }

  readCurrentLine(asStringFlag) {
    const currentLineContent = this._sourceLines[this._currentLineIndex++];
    const atoms = currentLineContent.split(" ");
    return asStringFlag ? atoms : atoms.map(val => Number(val));
  }

  readMultipleLines(count, asStringFlag) {
    const lines = this._sourceLines;
    const startIndex = this._currentLineIndex;
    const resultMatrix = [];

    for (let i = 0; i < count; i++) {
      const lineContent = lines[startIndex + i];
      const rowAtoms = lineContent.split(" ");
      resultMatrix[i] = asStringFlag ? rowAtoms : rowAtoms.map(val => Number(val));
    }
    this._currentLineIndex += count;
    return resultMatrix;
  }
}

const inputReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

const calculateParity = (valA, valB) => (valA + valB) & 1;

const generateSingleMove = (coordinatesArray) => {
  let moveCharacter = '';
  if (coordinatesArray[0] > 0) {
    coordinatesArray[0]--;
    moveCharacter = 'R';
  } else if (coordinatesArray[0] < 0) {
    coordinatesArray[0]++;
    moveCharacter = 'L';
  } else if (coordinatesArray[1] > 0) {
    coordinatesArray[1]--;
    moveCharacter = 'U';
  } else { // coordinatesArray[1] < 0
    coordinatesArray[1]++;
    moveCharacter = 'D';
  }
  return moveCharacter;
};

function processMainLogic() {
  const numDataSets = inputReader.readNextAtom();
  const dataSetCoordinates = inputReader.readMultipleLines(numDataSets);

  const initialParity = calculateParity(dataSetCoordinates[0][0], dataSetCoordinates[0][1]);

  for (let dataIdx = 1; dataIdx < numDataSets; dataIdx++) {
    const currentParity = calculateParity(dataSetCoordinates[dataIdx][0], dataSetCoordinates[dataIdx][1]);
    if (currentParity !== initialParity) {
      return -1;
    }
  }

  const totalSteps = 20 - initialParity;
  const stepMagnitudes = Array(totalSteps).fill(1);

  const pathStrings = [];

  for (let dataIdx = 0; dataIdx < numDataSets; dataIdx++) {
    let currentPath = "";
    for (let stepIdx = 0; stepIdx < totalSteps; stepIdx++) {
      currentPath += generateSingleMove(dataSetCoordinates[dataIdx]);
    }
    pathStrings.push(currentPath);
  }

  return totalSteps + "\n" + stepMagnitudes.join(" ") + "\n" + pathStrings.join("\n");
}

console.log(processMainLogic());
