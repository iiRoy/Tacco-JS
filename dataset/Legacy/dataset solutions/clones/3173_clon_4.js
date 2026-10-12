var inputLinesBuffer = [];

var inputOutputInterface = require("readline").createInterface({
  input:  process.stdin,
  output: process.stdout
});

inputOutputInterface.on('line', function(currentLineContent) {
  inputLinesBuffer.push(currentLineContent);
});

let minimumTotalCost = Infinity;

inputOutputInterface.on('close', function() {
  const firstLineData = inputLinesBuffer.shift();
  const parsedFirstLine = firstLineData.split(" ").map(Number);
  const numBamboos = parsedFirstLine[0];
  const targetLengthA = parsedFirstLine[1];
  const targetLengthB = parsedFirstLine[2];
  const targetLengthC = parsedFirstLine[3];

  const bambooLengths = inputLinesBuffer.map(Number);

  const totalPossibleAssignments = Math.pow(4, numBamboos);

  for (let assignmentIndex = 0; assignmentIndex < totalPossibleAssignments; assignmentIndex++) {
    let currentAssignmentVector = [];
    let tempAssignmentValue = assignmentIndex;
    for (let idx = 0; idx < numBamboos; idx++) {
      currentAssignmentVector.unshift(tempAssignmentValue % 4);
      tempAssignmentValue = Math.floor(tempAssignmentValue / 4);
    }
    
    const currentCost = calculateCombinationCost(currentAssignmentVector, bambooLengths, targetLengthA, targetLengthB, targetLengthC);
    if (currentCost < minimumTotalCost) {
      minimumTotalCost = currentCost;
    }
  }

  console.log(minimumTotalCost);
});

function calculateCombinationCost(assignmentVector, bambooLengths, targetLengthA, targetLengthB, targetLengthC) {
    let currentSums = [0, 0, 0]; // Index 0 for A, 1 for B, 2 for C
    let countsOfUsedBamboos = [0, 0, 0]; // Index 0 for A, 1 for B, 2 for C

    assignmentVector.forEach((assignmentType, idx) => {
        const currentBambooLength = bambooLengths[idx];
        if (assignmentType >= 0 && assignmentType <= 2) { // 0, 1, 2 correspond to targets A, B, C
            currentSums[assignmentType] += currentBambooLength;
            if (currentBambooLength !== 0) { // Only count non-zero length bamboos for MP cost
                countsOfUsedBamboos[assignmentType]++;
            }
        }
        // assignmentType 3 (discard) does nothing
    });

    // If any target has a sum of 0, it means no bamboos were effectively assigned to it.
    // This combination is invalid according to the problem's implicit requirement (a>0 && b>0 && c>0).
    if (currentSums[0] === 0 || currentSums[1] === 0 || currentSums[2] === 0) {
        return Infinity;
    }

    let currentCombinationCost = 0;
    currentCombinationCost += Math.abs(targetLengthA - currentSums[0]);
    currentCombinationCost += Math.abs(targetLengthB - currentSums[1]);
    currentCombinationCost += Math.abs(targetLengthC - currentSums[2]);

    // Add MP cost for additional bamboos (only non-zero length ones)
    countsOfUsedBamboos.forEach(count => {
        currentCombinationCost += Math.max(0, count - 1) * 10;
    });

    return currentCombinationCost;
}
