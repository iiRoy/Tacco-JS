process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
    const inputParts = inputData.split(' ');

    const firstPartString = inputParts[0];
    const secondPartString = inputParts[1];
    const thirdPartString = inputParts[2];

    const lowerBoundValue = Number(firstPartString);
    const upperBoundValue = Number(secondPartString);
    const divisorTargetValue = Number(thirdPartString);

    let totalDivisibleCount = 0;

    let currentIterationNumber = lowerBoundValue;

    while (currentIterationNumber < upperBoundValue) {
        const remainderResult = divisorTargetValue % currentIterationNumber;

        if (remainderResult === 0) {
            totalDivisibleCount++;
        }
        currentIterationNumber++;
    }
    console.log(totalDivisibleCount);
});
