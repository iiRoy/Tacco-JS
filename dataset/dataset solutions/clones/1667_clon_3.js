function processData(inputString) {
    const inputSegments = inputString.split(" ");
    const numericParameters = inputSegments.map(segment => parseInt(segment, 10));

    const startValue = numericParameters[0];
    const endValue = numericParameters[1];
    const divisorCandidate = numericParameters[2];

    let totalDivisibleCount = 0;

    const stepSize = 1; // A constant representing the increment for iteration

    // Helper function to determine divisibility
    const checkDivisibility = (numberToCheck, currentDivisor) => {
        return numberToCheck % currentDivisor === 0;
    };

    for (let currentNumber = startValue; currentNumber <= endValue; currentNumber += stepSize) {
        if (checkDivisibility(currentNumber, divisorCandidate)) {
            totalDivisibleCount++;
        }
    }

    console.log(totalDivisibleCount);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
