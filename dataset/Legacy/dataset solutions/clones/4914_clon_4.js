function processInput(inputLines) {
    const totalCount = Number(inputLines[0]);
    const initialAccumulator = { currentX: 1, currentY: 1 };

    const finalState = inputLines.slice(1, totalCount + 1).reduce((previousState, lineSegment) => {
        const [targetX, targetY] = lineSegment.split(" ").map(Number);

        let { currentX, currentY } = previousState;

        if (targetX >= currentX && targetY >= currentY) {
            currentX = targetX;
            currentY = targetY;
        } else {
            const scaleFactorX = Math.ceil(currentX / targetX);
            const scaleFactorY = Math.ceil(currentY / targetY);
            const effectiveScale = Math.max(scaleFactorX, scaleFactorY);
            currentX = effectiveScale * targetX;
            currentY = effectiveScale * targetY;
        }
        return { currentX, currentY };
    }, initialAccumulator);

    console.log(finalState.currentX + finalState.currentY);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
