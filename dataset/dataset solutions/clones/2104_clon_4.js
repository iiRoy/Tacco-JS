const rawInputSource = require('fs').readFileSync('/dev/stdin', 'UTF-8').trim();
const numericStrings = rawInputSource.split("\n")[0].split(" ");

const targetPercentageOne = Number(numericStrings[0]);
const targetPercentageTwo = Number(numericStrings[1]);

const divisorOne = 0.08;
const divisorTwo = 0.1;

// Calculate the range of values for the first condition:
// targetPercentageOne <= candidateValue * divisorOne < targetPercentageOne + 1
// This implies:
// targetPercentageOne / divisorOne <= candidateValue < (targetPercentageOne + 1) / divisorOne
const lowerBoundOne = targetPercentageOne / divisorOne;
const upperBoundOne = (targetPercentageOne + 1) / divisorOne;

// Calculate the range of values for the second condition:
// targetPercentageTwo <= candidateValue * divisorTwo < targetPercentageTwo + 1
// This implies:
// targetPercentageTwo / divisorTwo <= candidateValue < (targetPercentageTwo + 1) / divisorTwo
const lowerBoundTwo = targetPercentageTwo / divisorTwo;
const upperBoundTwo = (targetPercentageTwo + 1) / divisorTwo;

// Determine the combined range where both conditions are met.
// The smallest integer candidate must be greater than or equal to the maximum of the lower bounds.
const potentialStart = Math.ceil(Math.max(lowerBoundOne, lowerBoundTwo));

// The largest integer candidate must be strictly less than the minimum of the upper bounds.
// We use Number.EPSILON to handle floating point precision and ensure strict inequality.
const potentialEnd = Math.floor(Math.min(upperBoundOne, upperBoundTwo) - Number.EPSILON);

let finalDetermination = -1;

// If the potential start is less than or equal to the potential end,
// it means there is at least one integer that satisfies both conditions.
// The smallest such integer is potentialStart.
if (potentialStart <= potentialEnd) {
    finalDetermination = potentialStart;
}

console.log(finalDetermination);