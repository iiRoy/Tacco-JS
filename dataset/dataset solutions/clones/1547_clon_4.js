const solveProblem = (inputString) => {
    const numericValues = inputString.split(" ").map(Number);
    const distanceVal = numericValues[0];
    const timeLimit = numericValues[1];
    const speedVal = numericValues[2];

    const isPossible = timeLimit * speedVal >= distanceVal;

    console.log(isPossible ? "Yes" : "No");
};

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
