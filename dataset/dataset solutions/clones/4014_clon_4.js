function processGridPathfinding(sourceData) {
    const dataSegments = sourceData.split("\n");

    const [dimHText, dimWText, skipDeltaText] = dataSegments[0].split(" ");
    const verticalExtent = Number(dimHText);
    const horizontalExtent = Number(dimWText);
    const traversalStride = Number(skipDeltaText);

    const coordinateReference = new Map();

    dataSegments.slice(1, 1 + verticalExtent).forEach((gridLineContent, currentLineIndex) => {
        const actualRowPosition = currentLineIndex + 1;
        gridLineContent.split(" ").forEach((cellValueString, currentColumnIndex) => {
            const actualColumnPosition = currentColumnIndex + 1;
            const numericalCellValue = Number(cellValueString);
            coordinateReference.set(numericalCellValue, { r: actualRowPosition, c: actualColumnPosition });
        });
    });

    const pathQueryCount = Number(dataSegments[1 + verticalExtent]);

    const pathSpecifications = dataSegments.slice(2 + verticalExtent, 2 + verticalExtent + pathQueryCount).map(queryDetailsLine => {
        const [startValTxt, endValTxt] = queryDetailsLine.split(" ");
        return { initialPointValue: Number(startValTxt), finalPointValue: Number(endValTxt) };
    });

    const calculateRectilinearDistance = (spotA, spotB) => {
        const rowDifference = Math.abs(spotA.r - spotB.r);
        const columnDifference = Math.abs(spotA.c - spotB.c);
        return rowDifference + columnDifference;
    };

    const finalDistancesCollection = pathSpecifications.map(individualPath => {
        const { initialPointValue, finalPointValue } = individualPath;

        const journeySegments = [];
        for (let currentVal = initialPointValue; currentVal < finalPointValue; currentVal += traversalStride) {
            journeySegments.push({ origin: currentVal, destination: currentVal + traversalStride });
        }

        const totalDistanceForCurrentPath = journeySegments.reduce((accumulatedLength, segment) => {
            const originCoordinates = coordinateReference.get(segment.origin);
            const destinationCoordinates = coordinateReference.get(segment.destination);
            return accumulatedLength + calculateRectilinearDistance(originCoordinates, destinationCoordinates);
        }, 0);

        return totalDistanceForCurrentPath;
    });

    console.log(finalDistancesCollection.join("\n"));
}

processGridPathfinding(require("fs").readFileSync("/dev/stdin", "utf8"));