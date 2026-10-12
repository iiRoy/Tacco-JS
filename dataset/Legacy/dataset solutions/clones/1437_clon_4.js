process.stdin.on("data", function(inputBuffer) {
    const processedInput = inputBuffer.toString().trim();
    const numericStrings = processedInput.split(" ");

    const calculationComponents = [
        [numericStrings[0], numericStrings[2]],
        [numericStrings[1], numericStrings[3]]
    ];

    const squaredValues = calculationComponents.map(segmentPair => {
        const combinedString = segmentPair[0] + segmentPair[1];
        const numericalRepresentation = Number(combinedString);
        return numericalRepresentation * numericalRepresentation;
    });

    const totalSumOfSquares = squaredValues.reduce((accumulated, currentVal) => accumulated + currentVal, 0);

    const finalResult = totalSumOfSquares ** 0.5;

    console.log(finalResult.toFixed(8));
}).resume();
