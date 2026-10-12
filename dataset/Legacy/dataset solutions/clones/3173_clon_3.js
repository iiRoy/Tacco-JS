var inputLines = [];

var totalBamboos, targetLengthA, targetLengthB, targetLengthC;
var bambooMeasurements;
var minimumMagicCost = Infinity;

const ASSIGN_TO_A = 0;
const ASSIGN_TO_B = 1;
const ASSIGN_TO_C = 2;
const ASSIGN_TO_DISCARD = 3;
const NUM_ASSIGNMENT_OPTIONS = 4;
const MAGIC_COST_PER_PIECE = 10;

var nodeReadline = require("readline");
var inputHandler = nodeReadline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

inputHandler.on('line', function(lineContent){
  inputLines.push(lineContent);
});

inputHandler.on('close', function(){
  processInputAndSolve();
});

function processInputAndSolve() {
  var configLine = inputLines.shift();
  var configParts = configLine.split(" ");

  totalBamboos = Number(configParts[0]);
  targetLengthA = Number(configParts[1]);
  targetLengthB = Number(configParts[2]);
  targetLengthC = Number(configParts[3]);

  bambooMeasurements = Array(totalBamboos);

  for(var idx = 0; idx < totalBamboos; idx++){
    bambooMeasurements[idx] = Number(inputLines[idx]);
  }

  exploreAssignments(0, []);
  console.log(minimumMagicCost);
}

function exploreAssignments(currentBambooIndex, currentAssignment) {
  if (currentBambooIndex === totalBamboos) {
    calculateCost(currentAssignment);
    return;
  }

  for (var optionIdx = 0; optionIdx < NUM_ASSIGNMENT_OPTIONS; optionIdx++) {
    currentAssignment[currentBambooIndex] = optionIdx;
    exploreAssignments(currentBambooIndex + 1, currentAssignment);
  }
}

function calculateTargetDiffCost(targetVal, currentSum) {
    return Math.abs(targetVal - currentSum);
}

function calculateCost(currentAssignment) {
  var sumA = 0;
  var sumB = 0;
  var sumC = 0;
  var piecesForA = 0;
  var piecesForB = 0;
  var piecesForC = 0;

  for (var idx = 0; idx < totalBamboos; idx++) {
    const assignedType = currentAssignment[idx];
    const currentBambooLength = bambooMeasurements[idx];

    if (currentBambooLength === 0) {
        continue;
    }

    if (assignedType === ASSIGN_TO_A) {
      sumA += currentBambooLength;
      piecesForA++;
    } else if (assignedType === ASSIGN_TO_B) {
      sumB += currentBambooLength;
      piecesForB++;
    } else if (assignedType === ASSIGN_TO_C) {
      sumC += currentBambooLength;
      piecesForC++;
    }
  }

  const adjustedPiecesA = Math.max(0, piecesForA - 1);
  const adjustedPiecesB = Math.max(0, piecesForB - 1);
  const adjustedPiecesC = Math.max(0, piecesForC - 1);

  if (sumA > 0 && sumB > 0 && sumC > 0) {
    const lengthDifferenceCost =
      calculateTargetDiffCost(targetLengthA, sumA) +
      calculateTargetDiffCost(targetLengthB, sumB) +
      calculateTargetDiffCost(targetLengthC, sumC);

    const magicCostFromPieces = (adjustedPiecesA + adjustedPiecesB + adjustedPiecesC) * MAGIC_COST_PER_PIECE;

    const currentTotalCost = lengthDifferenceCost + magicCostFromPieces;

    minimumMagicCost = Math.min(minimumMagicCost, currentTotalCost);
  }
}
