const processInput = (sourceText) => {
    const textLines = sourceText.trim().split('\n');

    const [pointQuantity, dimensionCount] = textLines[0].split(' ').map(Number);

    const spatialPoints = textLines.slice(1, 1 + pointQuantity).map(line =>
        line.split(' ').map(Number)
    );

    let integralDistanceCount = 0;

    Array.from({ length: pointQuantity }).forEach((_, primaryIndex) => {
        Array.from({ length: primaryIndex }).forEach((_, secondaryIndex) => {
            const currentPoint = spatialPoints[primaryIndex];
            const comparedPoint = spatialPoints[secondaryIndex];

            const sumOfSquaredDifferences = currentPoint.reduce((accumulator, coordA, dimensionIndex) => {
                const coordB = comparedPoint[dimensionIndex];
                return accumulator + Math.pow(coordA - coordB, 2);
            }, 0);

            const calculatedDistance = Math.sqrt(sumOfSquaredDifferences);

            if (calculatedDistance % 1 === 0) {
                integralDistanceCount++;
            }
        });
    });

    console.log(integralDistanceCount);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));