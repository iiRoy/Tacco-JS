'use strict';

const parseInitialParams = (lineContent) => {
    const numericParts = lineContent.split(' ').map(Number);
    return {
        initialWidth: numericParts[0],
        initialHeight: numericParts[1],
        numberOfQueries: numericParts[2]
    };
};

const parseQueryData = (queryLines) => {
    const xCoordinates = [];
    const yCoordinates = [];
    const queryActionTypes = [];

    for (const line of queryLines) {
        const parts = line.split(' ').map(Number);
        xCoordinates.push(parts[0]);
        yCoordinates.push(parts[1]);
        queryActionTypes.push(parts[2]);
    }
    return { xCoordinates, yCoordinates, queryActionTypes };
};

const processInput = (rawData) => {
    const allInputLines = rawData.trim().split("\n");

    const { initialWidth, initialHeight, numberOfQueries } = parseInitialParams(allInputLines[0]);
    const { xCoordinates, yCoordinates, queryActionTypes } = parseQueryData(allInputLines.slice(1));

    // Define the current bounding box using four corner points.
    // The order is: [bottom-left, top-left, top-right, bottom-right]
    let currentBoundingBox = [
        { x: 0, y: 0 },
        { x: 0, y: initialHeight },
        { x: initialWidth, y: initialHeight },
        { x: initialWidth, y: 0 }
    ];

    // Iterate through each query and adjust the bounding box
    for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
        const actionType = queryActionTypes[queryIndex];
        const currentXValue = xCoordinates[queryIndex];
        const currentYValue = yCoordinates[queryIndex];

        switch (actionType) {
            case 1: // Cut from the left (x < currentXValue), effectively increasing the minimum x-coordinate
                currentBoundingBox[0].x = Math.max(currentBoundingBox[0].x, currentXValue);
                currentBoundingBox[1].x = Math.max(currentBoundingBox[1].x, currentXValue);
                break;
            case 2: // Cut from the right (x > currentXValue), effectively decreasing the maximum x-coordinate
                currentBoundingBox[2].x = Math.min(currentBoundingBox[2].x, currentXValue);
                currentBoundingBox[3].x = Math.min(currentBoundingBox[3].x, currentXValue);
                break;
            case 3: // Cut from the bottom (y < currentYValue), effectively increasing the minimum y-coordinate
                currentBoundingBox[0].y = Math.max(currentBoundingBox[0].y, currentYValue);
                currentBoundingBox[3].y = Math.max(currentBoundingBox[3].y, currentYValue);
                break;
            case 4: // Cut from the top (y > currentYValue), effectively decreasing the maximum y-coordinate
                currentBoundingBox[1].y = Math.min(currentBoundingBox[1].y, currentYValue);
                currentBoundingBox[2].y = Math.min(currentBoundingBox[2].y, currentYValue);
                break;
        }
    }

    // Calculate the final dimensions of the remaining area
    const finalMinX = currentBoundingBox[0].x;
    const finalMaxX = currentBoundingBox[2].x;
    const finalMinY = currentBoundingBox[0].y;
    const finalMaxY = currentBoundingBox[1].y;

    const effectiveWidth = finalMaxX - finalMinX;
    const effectiveHeight = finalMaxY - finalMinY;

    // If the effective width or height is non-positive, the area is 0 (box has collapsed or inverted)
    const calculatedArea = (effectiveWidth > 0 && effectiveHeight > 0) ? (effectiveWidth * effectiveHeight) : 0;

    console.log(calculatedArea);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
