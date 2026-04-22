'use strict'
function TrajectoryEvaluator(inputData) {
    const tokens = inputData.trim().split(/\s+/);
    let position = 0;
    const gridYBound = Number(tokens[position++]);
    const gridXBound = Number(tokens[position++]);
    const sequenceLength = Number(tokens[position++]);
    const startingY = Number(tokens[position++]);
    const startingX = Number(tokens[position++]);
    const avatarPath = tokens[position++];
    const adversaryPath = tokens[position++];

    const initialCondition = {
        xMin: startingX,
        xMax: startingX,
        yMin: startingY,
        yMax: startingY,
        status: true
    };

    const actionSeries = Array.from({ length: sequenceLength }, (_, k) => ({
        avatarMove: avatarPath[k],
        adversaryMove: adversaryPath[k]
    }));

    const outcome = actionSeries.reduce((currentRegion, currentAction) => {
        if (!currentRegion.status) {
            return currentRegion;
        }

        // Apply avatar's potential move
        const potentialXMin = currentRegion.xMin - (currentAction.avatarMove === 'L' ? 1 : 0);
        const potentialXMax = currentRegion.xMax + (currentAction.avatarMove === 'R' ? 1 : 0);
        const potentialYMin = currentRegion.yMin - (currentAction.avatarMove === 'U' ? 1 : 0);
        const potentialYMax = currentRegion.yMax + (currentAction.avatarMove === 'D' ? 1 : 0);

        // Check if avatar goes off grid after its move
        if (potentialXMin === 0 || potentialXMax === gridXBound + 1 || potentialYMin === 0 || potentialYMax === gridYBound + 1) {
            return { ...currentRegion, status: false };
        }

        // Apply adversary's restriction and clamp boundaries (replicating original's specific logic)
        const finalXMin = Math.min(potentialXMin + (currentAction.adversaryMove === 'R' ? 1 : 0), gridXBound);
        const finalXMax = Math.max(finalXMin - (currentAction.adversaryMove === 'L' ? 1 : 0), 1);
        const finalYMin = Math.min(finalXMin + (currentAction.adversaryMove === 'D' ? 1 : 0), gridYBound);
        const finalYMax = Math.max(finalXMin - (currentAction.adversaryMove === 'U' ? 1 : 0), 1);

        return {
            xMin: finalXMin,
            xMax: finalXMax,
            yMin: finalYMin,
            yMax: finalYMax,
            status: true
        };
    }, initialCondition);

    if (outcome.status) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

TrajectoryEvaluator(require('fs').readFileSync('/dev/stdin', 'utf8'));