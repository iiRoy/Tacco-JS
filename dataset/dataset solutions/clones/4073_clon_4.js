const journeyVerifier = (rawDataContent) => {
    const allInputLines = rawDataContent.split("\n");
    const quantityOfPoints = Number(allInputLines[0]);
    const pointDescriptors = allInputLines.slice(1, quantityOfPoints + 1);

    const parseCoordinates = (descriptionString) => {
        const numericParts = descriptionString.split(" ");
        return numericParts.map(Number);
    };

    const parsedPoints = pointDescriptors.map(parseCoordinates);

    let atLeastOneValidMove = false;

    if (quantityOfPoints >= 2) {
        atLeastOneValidMove = Array.from({ length: quantityOfPoints - 1 }).some((_, segmentIndex) => {
            const [timeA, posXA, posYA] = parsedPoints[segmentIndex];
            const [timeB, posXB, posYB] = parsedPoints[segmentIndex + 1];

            const elapsedDuration = timeB - timeA;
            const absoluteSumDifference = Math.abs((posXB + posYB) - (posXA + posYA));

            const withinTimeLimit = absoluteSumDifference <= elapsedDuration;
            const parityMatches = (absoluteSumDifference % 2) === (elapsedDuration % 2);

            return withinTimeLimit && parityMatches;
        });
    }

    const finalVerdict = atLeastOneValidMove ? "YES" : "NO";
    console.log(finalVerdict);
};

journeyVerifier(require("fs").readFileSync("/dev/stdin", "utf8"));