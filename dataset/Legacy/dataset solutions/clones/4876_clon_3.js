function processInputData(rawDataString) {
    const lines = rawDataString.split("\n");

    const parseNumericValue = (str) => parseInt(str, 10);

    const initialBoundaryParts = lines[0].split(" ");
    let currentMaxX = parseNumericValue(initialBoundaryParts[0]);
    let currentMinX = 0;
    let currentMaxY = parseNumericValue(initialBoundaryParts[1]);
    let currentMinY = 0;

    const processSingleConstraint = (constraintLine) => {
        const lineSegments = constraintLine.split(" ");
        const xCoordinate = parseNumericValue(lineSegments[0]);
        const yCoordinate = parseNumericValue(lineSegments[1]);
        const constraintIdentifier = parseNumericValue(lineSegments[2]);

        switch (constraintIdentifier) {
            case 1: // Update minimum X boundary
                if (currentMinX < xCoordinate) {
                    currentMinX = xCoordinate;
                }
                break;
            case 2: // Update maximum X boundary
                if (currentMaxX > xCoordinate) {
                    currentMaxX = xCoordinate;
                }
                break;
            case 3: // Update minimum Y boundary
                if (currentMinY < yCoordinate) {
                    currentMinY = yCoordinate;
                }
                break;
            case 4: // Update maximum Y boundary
                if (currentMaxY > yCoordinate) {
                    currentMaxY = yCoordinate;
                }
                break;
        }
    };

    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        const lineContent = lines[lineIndex];
        if (lineContent.trim() === "") {
            continue; // Skip empty lines if any
        }
        processSingleConstraint(lineContent);
    }

    const effectiveWidth = currentMaxX - currentMinX;
    const effectiveHeight = currentMaxY - currentMinY;

    let calculatedArea = 0;
    if (effectiveWidth > 0 && effectiveHeight > 0) {
        calculatedArea = effectiveWidth * effectiveHeight;
    }

    console.log(calculatedArea);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
