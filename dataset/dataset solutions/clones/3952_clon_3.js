const GRID_DIMENSION = 100;
const HALF_DIMENSION = 50;
const EMPTY_SYMBOL = '.';
const FILLED_SYMBOL = '#';

function processInput(rawInputData) {
  const inputLines = rawInputData.split("\n");
  const firstLineValues = inputLines[0].split(" ");
  const countA = parseInt(firstLineValues[0]);
  const countB = parseInt(firstLineValues[1]);

  let outputMatrix = Array.from({ length: GRID_DIMENSION }, (_, rowIndex) => {
    const initialCellType = rowIndex < HALF_DIMENSION ? EMPTY_SYMBOL : FILLED_SYMBOL;
    return new Array(GRID_DIMENSION).fill(initialCellType);
  });

  // Apply modifications based on countB
  for (let currentIterationB = 0; currentIterationB < countB - 1; currentIterationB++) {
    const targetRowIndexB = Math.floor(currentIterationB / HALF_DIMENSION) * 2;
    const targetColIndexB = (currentIterationB % HALF_DIMENSION) * 2;
    outputMatrix[targetRowIndexB][targetColIndexB] = FILLED_SYMBOL;
  }

  // Apply modifications based on countA
  for (let currentIterationA = 0; currentIterationA < countA - 1; currentIterationA++) {
    const targetRowIndexA = (GRID_DIMENSION - 1) - (Math.floor(currentIterationA / HALF_DIMENSION) * 2);
    const targetColIndexA = (currentIterationA % HALF_DIMENSION) * 2;
    outputMatrix[targetRowIndexA][targetColIndexA] = EMPTY_SYMBOL;
  }

  // Format the output
  const gridContentStrings = outputMatrix.map(row => row.join(''));
  const headerString = `${GRID_DIMENSION} ${GRID_DIMENSION}`;
  const finalOutputLines = [headerString, ...gridContentStrings];
  const completeOutput = finalOutputLines.join("\n");

  console.log(completeOutput);
}

// Function for local debugging purposes
function executeDebug() {
  var debugSource = document.getElementById("input").value;
  processInput(debugSource);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
