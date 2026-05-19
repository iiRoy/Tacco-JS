const calculateGridParity = (coordinateValue, cellSize) => {
    return Math.floor(coordinateValue / cellSize) % 2;
};

const derivePointColor = (referenceX, referenceY, baseGridColor, gridSize, targetX, targetY) => {
    const xOffsetParity = calculateGridParity(targetX - referenceX, gridSize);
    const yOffsetParity = calculateGridParity(targetY - referenceY, gridSize);
    return baseGridColor ^ (xOffsetParity ^ yOffsetParity);
};

const processInputData = (inputContent) => {
    const lines = inputContent.split("\n");

    const [pointCountStr, kSizeStr] = lines[0].split(" ");
    const totalPoints = Number(pointCountStr);
    const gridDimension = Number(kSizeStr);

    const allPoints = lines.slice(1, totalPoints + 1).map(line => {
        const [coordX, coordY, colorChar] = line.split(" ");
        return {
            x: Number(coordX),
            y: Number(coordY),
            color: colorChar === "B" ? 0 : 1
        };
    });

    const initialReferenceColor = allPoints[0].color;

    let maximumMatches = 0;

    allPoints.forEach(currentAnchorPoint => {
        Array.from({ length: gridDimension }, (_, xShiftIndex) => {
            Array.from({ length: gridDimension }, (_, yShiftIndex) => {
                const currentReferenceX = currentAnchorPoint.x - xShiftIndex;
                const currentReferenceY = currentAnchorPoint.y - yShiftIndex;

                const currentAlignmentMatches = allPoints.reduce((accumulator, targetPoint) => {
                    const expectedColor = derivePointColor(
                        currentReferenceX,
                        currentReferenceY,
                        initialReferenceColor,
                        gridDimension,
                        targetPoint.x,
                        targetPoint.y
                    );
                    return accumulator + (expectedColor === targetPoint.color ? 1 : 0);
                }, 0);

                if (currentAlignmentMatches > maximumMatches) {
                    maximumMatches = currentAlignmentMatches;
                }
            });
        });
    });

    console.log(maximumMatches);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
