process.stdin.on("data", function(inputBuffer) {
    const lineSegments = String(inputBuffer).trim().split("\n");

    const processSegmentsRecursively = (currentIdx) => {
        const countString = lineSegments[currentIdx];
        if (!countString || Number(countString) === 0) {
            return;
        }

        const dataQuantity = Number(countString);
        const dataValuesString = lineSegments[currentIdx + 1];
        const rawValueStrings = dataValuesString.split(" ");

        const numericDataPoints = rawValueStrings.map(Number);

        const sumOfPoints = numericDataPoints.reduce((accumulator, value) => accumulator + value, 0);
        const meanValue = sumOfPoints / dataQuantity;

        const sumOfSquaredDeviations = numericDataPoints.reduce((accumulator, value) => {
            const deviation = value - meanValue;
            return accumulator + (deviation * deviation);
        }, 0);

        const calculatedVariance = sumOfSquaredDeviations / dataQuantity;
        const finalStandardDeviation = Math.sqrt(calculatedVariance);

        console.log(finalStandardDeviation.toFixed(8));

        processSegmentsRecursively(currentIdx + 2);
    };

    processSegmentsRecursively(0);
}).resume();
