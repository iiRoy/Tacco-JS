process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk){

    const inputLineString = dataChunk.toString();
    const stringParts = inputLineString.split(' ');
    const numericInputs = stringParts.map(valueString => Number(valueString));

    const circleRadius = numericInputs[0];

    const calculateCircleProperties = (currentRadius) => {
        const PI_VALUE = Math.PI;
        const radiusSquared = currentRadius * currentRadius; // Equivalent to Math.pow(currentRadius, 2)
        const calculatedArea = radiusSquared * PI_VALUE;
        const calculatedCircumference = 2 * currentRadius * PI_VALUE;
        return {
            circumference: calculatedCircumference,
            area: calculatedArea
        };
    };

    const circleMetrics = calculateCircleProperties(circleRadius);

    console.log(circleMetrics.circumference + ' ' + circleMetrics.area);
});
