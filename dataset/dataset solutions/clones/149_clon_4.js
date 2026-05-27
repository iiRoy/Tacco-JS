(function(inputContent) {
    const processedGrid = inputContent
        .replace(/\n$/, '')
        .split('\n')
        .map(line => line.split('').map(Number));

    function isValidCell(gridMatrix, columnIndex, rowIndex) {
        const totalRows = gridMatrix.length;
        if (totalRows === 0) return false;
        const totalColumns = gridMatrix[0].length;

        if (rowIndex < 0 || rowIndex >= totalRows || columnIndex < 0 || columnIndex >= totalColumns) {
            return false;
        }
        return gridMatrix[rowIndex][columnIndex] === 1;
    }

    function navigatePath(gridData, startX, startY, initialDirection) {
        const traversalStack = [{ x: startX, y: startY, d: initialDirection, pathAccumulator: '' }];

        const directionalMoves = {
            'R': [
                { deltaX: 1, deltaY: -1, nextDirection: 'U', pathChar: 'U' },
                { deltaX: 1, deltaY: 0, nextDirection: 'R', pathChar: 'R' },
                { deltaX: 1, deltaY: 1, nextDirection: 'D', pathChar: 'D' },
                { deltaX: 0, deltaY: 0, nextDirection: 'L', pathChar: 'L', isFallback: true }
            ],
            'L': [
                { deltaX: 0, deltaY: 1, nextDirection: 'D', pathChar: 'D' },
                { deltaX: -1, deltaY: 0, nextDirection: 'L', pathChar: 'L' },
                { deltaX: 0, deltaY: -1, nextDirection: 'U', pathChar: 'U' },
                { deltaX: 0, deltaY: 0, nextDirection: 'R', pathChar: 'R', isFallback: true }
            ],
            'D': [
                { deltaX: 0, deltaY: 1, nextDirection: 'R', pathChar: 'R' },
                { deltaX: 0, deltaY: 2, nextDirection: 'D', pathChar: 'D' },
                { deltaX: -1, deltaY: 1, nextDirection: 'L', pathChar: 'L' },
                { deltaX: 0, deltaY: 0, nextDirection: 'U', pathChar: 'U', isFallback: true }
            ],
            'U': [
                { deltaX: -1, deltaY: -1, nextDirection: 'L', pathChar: 'L' },
                { deltaX: 0, deltaY: -2, nextDirection: 'U', pathChar: 'U' },
                { deltaX: 0, deltaY: -1, nextDirection: 'R', pathChar: 'R' },
                { deltaX: 0, deltaY: 0, nextDirection: 'D', pathChar: 'D', isFallback: true }
            ]
        };

        while (traversalStack.length > 0) {
            const { x: currentX, y: currentY, d: currentDirection, pathAccumulator: currentPath } = traversalStack.pop();

            console.log(gridData, currentX, currentY, currentDirection);

            if (currentX === 0 && currentY === 0 && currentDirection === 'L') {
                return currentPath;
            }

            const possibleMoves = directionalMoves[currentDirection];
            let moveExecuted = false;

            for (const moveDefinition of possibleMoves) {
                const nextX = currentX + moveDefinition.deltaX;
                const nextY = currentY + moveDefinition.deltaY;

                if (moveDefinition.isFallback) {
                    traversalStack.push({
                        x: currentX, // Fallback stays at current coordinates
                        y: currentY, // Fallback stays at current coordinates
                        d: moveDefinition.nextDirection,
                        pathAccumulator: currentPath + moveDefinition.pathChar
                    });
                    moveExecuted = true;
                    break;
                } else if (isValidCell(gridData, nextX, nextY)) {
                    traversalStack.push({
                        x: nextX,
                        y: nextY,
                        d: moveDefinition.nextDirection,
                        pathAccumulator: currentPath + moveDefinition.pathChar
                    });
                    moveExecuted = true;
                    break;
                }
            }
        }
        return '';
    }

    const finalRoute = navigatePath(processedGrid, 0, 0, 'R');
    console.log('R' + finalRoute);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
