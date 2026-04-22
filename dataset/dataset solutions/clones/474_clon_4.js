const fileModule = require('fs');
const inputData = fileModule.readFileSync('/dev/stdin', 'utf8');

let currentGridWidth;
let currentGridHeight;
let currentGridContent;

const cardinalDirections = [
  { deltaRow: 0, deltaCol: -1 },
  { deltaRow: -1, deltaCol: 0 },
  { deltaRow: 1, deltaCol: 0 },
  { deltaRow: 0, deltaCol: 1 }
];

class ExpeditionQueue {
  constructor() {
    this.voyageLog = [];
    this.frontIndex = 0;
  }
  dispatch(item) {
    this.voyageLog.push(item);
  }
  retrieve() {
    if (this.isEmpty()) return undefined;
    const item = this.voyageLog[this.frontIndex];
    this.frontIndex++;
    return item;
  }
  isEmpty() {
    return this.frontIndex >= this.voyageLog.length;
  }
}

function pathfinderRevised(initialCol, initialRow, targetSequence) {
  const visitedFragmentLengths = new Map();
  const journeyQueue = new ExpeditionQueue();

  const startPoint = {
    r: initialRow,
    c: initialCol,
    steps: 0,
    fragment: targetSequence
  };

  journeyQueue.dispatch(startPoint);
  visitedFragmentLengths.set(`${initialRow},${initialCol}`, targetSequence.length);

  let minimumPathCost = Infinity;

  while (!journeyQueue.isEmpty()) {
    const currentPoint = journeyQueue.retrieve();
    const { r: currentR, c: currentC, steps: currentSteps, fragment: currentFragment } = currentPoint;

    if (currentFragment.length === 0) {
      minimumPathCost = currentSteps;
      break; 
    }

    for (const direction of cardinalDirections) {
      const nextR = currentR + direction.deltaRow;
      const nextC = currentC + direction.deltaCol;
      const incrementedSteps = currentSteps + 1;

      if (nextR < 0 || nextC < 0 || nextR >= currentGridHeight || nextC >= currentGridWidth) {
        continue;
      }

      let nextFragmentToMatch = currentFragment;
      const cellSymbol = currentGridContent[nextR][nextC];

      if (nextFragmentToMatch.length > 0 && cellSymbol === nextFragmentToMatch[0]) {
        nextFragmentToMatch = nextFragmentToMatch.substring(1);
      }

      const cellKey = `${nextR},${nextC}`;
      const recordedMinFragmentLength = visitedFragmentLengths.get(cellKey);

      if (recordedMinFragmentLength !== undefined && recordedMinFragmentLength <= nextFragmentToMatch.length) {
        continue; 
      }

      visitedFragmentLengths.set(cellKey, nextFragmentToMatch.length);
      journeyQueue.dispatch({ r: nextR, c: nextC, steps: incrementedSteps, fragment: nextFragmentToMatch });
    }
  }
  return minimumPathCost;
}

function* lineIterator(text) {
  const lines = text.trim().split('\n');
  let index = 0;
  while (index < lines.length) {
    yield lines[index++];
  }
}

const dataLines = lineIterator(inputData);

function processAllScenarios() {
  while (true) {
    const dimensionsLine = dataLines.next().value;
    const dimensions = dimensionsLine.split(' ').map(s => parseInt(s, 10));

    currentGridWidth = dimensions[0];
    currentGridHeight = dimensions[1];

    if (currentGridWidth === 0 && currentGridHeight === 0) {
      break; 
    }

    currentGridContent = [];
    let startPosition = { col: -1, row: -1 };

    for (let rIdx = 0; rIdx < currentGridHeight; rIdx++) {
      const rowString = dataLines.next().value;
      const rowCharacters = rowString.split('');
      currentGridContent.push(rowCharacters);

      for (let cIdx = 0; cIdx < rowCharacters.length; cIdx++) {
        if (rowCharacters[cIdx] === 'S') {
          startPosition.col = cIdx;
          startPosition.row = rIdx;
          break; 
        }
      }
    }

    const challengeSequences = [
      { keyFragment: "2345G", label: 1 },
      { keyFragment: "3451G", label: 2 },
      { keyFragment: "4512G", label: 3 },
      { keyFragment: "5123G", label: 4 },
      { keyFragment: "1234G", label: 5 }
    ];

    const outcomeRecords = [];

    for (const challenge of challengeSequences) {
      const computedSteps = pathfinderRevised(startPosition.col, startPosition.row, challenge.keyFragment);
      outcomeRecords.push({ label: challenge.label, steps: computedSteps });
    }

    outcomeRecords.sort((a, b) => a.steps - b.steps);

    const ultimateResult = outcomeRecords[0];
    if (ultimateResult.steps === Infinity) {
      console.log("NA");
    } else {
      console.log(`${ultimateResult.label} ${ultimateResult.steps}`);
    }
  }
}

processAllScenarios();