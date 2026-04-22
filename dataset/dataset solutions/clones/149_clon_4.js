(function(sourceData) {
    const lineSegments = sourceData.trimEnd().split('\n');
    const pathingLayout = lineSegments.map(segment => segment.split('').map(Number));

    const verifyAccess = (layout, targetCol, targetRow) => {
        if (targetRow < 0 || targetRow >= layout.length) {
            return false;
        }
        if (targetCol < 0 || targetCol >= layout[targetRow].length) {
            return false;
        }
        return layout[targetRow][targetCol] === 1;
    };

    const chartCourse = (mazeLayout, initialCol, initialRow, initialHeading) => {
        let currentColumn = initialCol;
        let currentRow = initialRow;
        let currentHeading = initialHeading;
        const journeyLog = [];

        const courseGuidelines = new Map([
            ['R', [
                { deltaX: 1, deltaY: -1, nextHeading: 'U', pathChar: 'U' },
                { deltaX: 1, deltaY: 0, nextHeading: 'R', pathChar: 'R' },
                { deltaX: 1, deltaY: 1, nextHeading: 'D', pathChar: 'D' }
            ]],
            ['L', [
                { deltaX: 0, deltaY: 1, nextHeading: 'D', pathChar: 'D' },
                { deltaX: -1, deltaY: 0, nextHeading: 'L', pathChar: 'L' },
                { deltaX: 0, deltaY: -1, nextHeading: 'U', pathChar: 'U' }
            ]],
            ['D', [
                { deltaX: 0, deltaY: 1, nextHeading: 'R', pathChar: 'R' },
                { deltaX: 0, deltaY: 2, nextHeading: 'D', pathChar: 'D' },
                { deltaX: -1, deltaY: 1, nextHeading: 'L', pathChar: 'L' }
            ]],
            ['U', [
                { deltaX: -1, deltaY: -1, nextHeading: 'L', pathChar: 'L' },
                { deltaX: 0, deltaY: -2, nextHeading: 'U', pathChar: 'U' },
                { deltaX: 0, deltaY: -1, nextHeading: 'R', pathChar: 'R' }
            ]]
        ]);

        const turningOptions = new Map([
            ['R', 'L'],
            ['L', 'R'],
            ['D', 'U'],
            ['U', 'D']
        ]);

        while (true) {
            if (currentColumn === 0 && currentRow === 0 && currentHeading === 'L') {
                break;
            }

            let movedSuccessfully = false;
            const possibleMoves = courseGuidelines.get(currentHeading);

            for (const moveAttempt of possibleMoves) {
                const proposedColumn = currentColumn + moveAttempt.deltaX;
                const proposedRow = currentRow + moveAttempt.deltaY;

                if (verifyAccess(mazeLayout, proposedColumn, proposedRow)) {
                    journeyLog.push(moveAttempt.pathChar);
                    currentColumn = proposedColumn;
                    currentRow = proposedRow;
                    currentHeading = moveAttempt.nextHeading;
                    movedSuccessfully = true;
                    break;
                }
            }

            if (!movedSuccessfully) {
                const fallbackHeading = turningOptions.get(currentHeading);
                journeyLog.push(fallbackHeading);
                currentHeading = fallbackHeading;
            }
        }
        return journeyLog.join('');
    };

    const finalPath = 'R' + chartCourse(pathingLayout, 0, 0, 'R');
    console.log(finalPath);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));