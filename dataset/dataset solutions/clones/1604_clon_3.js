const parseNumericInput = (inputLine) => {
    const trimmedLine = inputLine.trim();
    const stringParts = trimmedLine.split(" ");
    return stringParts.map(part => parseInt(part, 10));
};

function calculateFinalDistance(inputString) {
    const numericParts = parseNumericInput(inputString);

    const startCoord = numericParts[0];
    const totalSteps = numericParts[1];
    const stepMagnitude = numericParts[2];

    const stepsTowardsOrigin = Math.floor(startCoord / stepMagnitude);

    let effectiveStepsCount;

    if (stepsTowardsOrigin >= totalSteps) {
        effectiveStepsCount = totalSteps;
    } else {
        const stepsBeyondOptimal = totalSteps - stepsTowardsOrigin;

        if (stepsBeyondOptimal % 2 === 0) {
            effectiveStepsCount = stepsTowardsOrigin;
        } else {
            effectiveStepsCount = stepsTowardsOrigin + 1;
        }
    }

    const finalPosition = startCoord - (stepMagnitude * effectiveStepsCount);

    const absoluteFinalDistance = Math.abs(finalPosition);

    console.log(absoluteFinalDistance);
}

calculateFinalDistance(require("fs").readFileSync("/dev/stdin", "utf8"));
