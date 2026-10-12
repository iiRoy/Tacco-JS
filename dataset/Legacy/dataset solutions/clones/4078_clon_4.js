const processInputData = (incomingLines) => {
    const [configString] = incomingLines;
    const [totalItemsString, baseDimensionString] = configString.split(" ");
    const totalItems = Number(totalItemsString);
    const baseDimension = Number(baseDimensionString);

    const initialPointData = incomingLines.slice(1, 1 + totalItems).map(lineContent => {
        const [rawXString, rawYString, initialColor] = lineContent.split(" ");
        const rawX = Number(rawXString);
        const rawY = Number(rawYString);

        const xRemainder = rawX % baseDimension;
        const yRemainder = rawY % baseDimension;

        const xGridSegment = Math.floor(rawX / baseDimension);
        const yGridSegment = Math.floor(rawY / baseDimension);

        const segmentParityMismatch = (xGridSegment % 2) !== (yGridSegment % 2);

        let effectiveColor = initialColor;
        if (segmentParityMismatch) {
            effectiveColor = (initialColor === "B" ? "W" : "B");
        }

        const finalXCoordinate = (effectiveColor === "W" ? xRemainder + baseDimension : xRemainder);
        const finalYCoordinate = yRemainder;

        return { x: finalXCoordinate, y: finalYCoordinate };
    });

    const allScores = [];
    for (let yShiftIterator = 0; yShiftIterator < 2 * baseDimension; yShiftIterator++) {
        for (let xShiftIterator = 0; xShiftIterator < baseDimension; xShiftIterator++) {
            const currentShiftScore = initialPointData.filter(pointElement => {
                const candidateX = xShiftIterator + pointElement.x;
                const candidateY = yShiftIterator + pointElement.y;

                const cyclicX = candidateX % (2 * baseDimension);
                const cyclicY = candidateY % (2 * baseDimension);

                return (cyclicX < baseDimension) === (cyclicY < baseDimension);
            }).length;
            allScores.push(currentShiftScore);
        }
    }

    const highestAgreementScore = Math.max(...allScores);

    console.log(highestAgreementScore);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));