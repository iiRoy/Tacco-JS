((inputSource) => {
    const parseGridInput = (textData) => {
        return textData
            .trimEnd()
            .split('\n')
            .map(rowStr => rowStr.split('').map(Number));
    };

    const navigatePath = (gridMatrix, startCoordX, startCoordY, initialHeading) => {
        let currentCoordX = startCoordX;
        let currentCoordY = startCoordY;
        let currentHeading = initialHeading;
        const pathSegments = [];

        const checkCellValidity = (cx, cy) => {
            if (cy < 0 || cy >= gridMatrix.length) {
                return false;
            }
            if (cx < 0 || cx >= gridMatrix[cy].length) {
                return false;
            }
            return gridMatrix[cy][cx] === 1;
        };

        const headingRules = {
            'R': {
                moves: [
                    { segment: 'U', deltaX: 1, deltaY: -1, newHeading: 'U' },
                    { segment: 'R', deltaX: 1, deltaY: 0, newHeading: 'R' },
                    { segment: 'D', deltaX: 1, deltaY: 1, newHeading: 'D' }
                ],
                default: { segment: 'L', deltaX: 0, deltaY: 0, newHeading: 'L' }
            },
            'L': {
                moves: [
                    { segment: 'D', deltaX: 0, deltaY: 1, newHeading: 'D' },
                    { segment: 'L', deltaX: -1, deltaY: 0, newHeading: 'L' },
                    { segment: 'U', deltaX: 0, deltaY: -1, newHeading: 'U' }
                ],
                default: { segment: 'R', deltaX: 0, deltaY: 0, newHeading: 'R' }
            },
            'D': {
                moves: [
                    { segment: 'R', deltaX: 0, deltaY: 1, newHeading: 'R' },
                    { segment: 'D', deltaX: 0, deltaY: 2, newHeading: 'D' },
                    { segment: 'L', deltaX: -1, deltaY: 1, newHeading: 'L' }
                ],
                default: { segment: 'U', deltaX: 0, deltaY: 0, newHeading: 'U' }
            },
            'U': {
                moves: [
                    { segment: 'L', deltaX: -1, deltaY: -1, newHeading: 'L' },
                    { segment: 'U', deltaX: 0, deltaY: -2, newHeading: 'U' },
                    { segment: 'R', deltaX: 0, deltaY: -1, newHeading: 'R' }
                ],
                default: { segment: 'D', deltaX: 0, deltaY: 0, newHeading: 'D' }
            }
        };

        while (true) {
            if (currentCoordX === 0 && currentCoordY === 0 && currentHeading === 'L') {
                break;
            }

            const currentRules = headingRules[currentHeading];
            let movementApplied = false;

            for (const potentialMove of currentRules.moves) {
                const nextCoordX = currentCoordX + potentialMove.deltaX;
                const nextCoordY = currentCoordY + potentialMove.deltaY;

                if (checkCellValidity(nextCoordX, nextCoordY)) {
                    pathSegments.push(potentialMove.segment);
                    currentCoordX = nextCoordX;
                    currentCoordY = nextCoordY;
                    currentHeading = potentialMove.newHeading;
                    movementApplied = true;
                    break;
                }
            }

            if (!movementApplied) {
                const fallbackMove = currentRules.default;
                pathSegments.push(fallbackMove.segment);
                currentCoordX += fallbackMove.deltaX;
                currentCoordY += fallbackMove.deltaY;
                currentHeading = fallbackMove.newHeading;
            }
        }

        return pathSegments.reverse().join('');
    };

    const processedGrid = parseGridInput(inputSource);
    const finalResult = 'R' + navigatePath(processedGrid, 0, 0, 'R');
    console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
