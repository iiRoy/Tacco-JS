const inputSource = require('fs');
const allLines = inputSource.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const elementCount = parseInt(allLines[0], 10);

let finalScore = 0;
// Calculate the initial base sum using a loop
// This is equivalent to (elementCount * (elementCount + 1) * (elementCount + 2)) / 6
for (let p = 1; p <= elementCount; p++) {
    finalScore += p * (elementCount - p + 1);
}

const edgesToProcess = allLines.slice(1);

// Process the edges and accumulate deductions using a functional reduce approach
const totalDeductions = edgesToProcess.reduce((accumulator, currentLine) => {
    const parts = currentLine.split(' ');
    let firstVal = parseInt(parts[0], 10);
    let secondVal = parseInt(parts[1], 10);

    // Ensure firstVal is the minimum and secondVal is the maximum
    const tempMin = Math.min(firstVal, secondVal);
    const tempMax = Math.max(firstVal, secondVal);
    firstVal = tempMin;
    secondVal = tempMax;

    // Calculate the term to subtract for this edge
    const termToRemove = firstVal * (elementCount - secondVal + 1);
    return accumulator + termToRemove;
}, 0);

finalScore -= totalDeductions;

process.stdout.write(finalScore.toString() + '\n');