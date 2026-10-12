const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = rawData.trim().split("\n");

while (true) {
    const dimensions = lineSegments.shift().split(" ");

    if (dimensions.join(" ") === "0 0") break;

    const elementCount = Number(dimensions[0]);
    const modifierCount = Number(dimensions[1]);

    const modifierValues = Array.from({ length: modifierCount }, () => Number(lineSegments.shift()));
    const targetLevels = Array.from({ length: elementCount }, () => Number(lineSegments.shift()));

    let currentLevelCosts = Array.from({ length: 256 }, () => Infinity);
    currentLevelCosts[128] = 0;

    const finalLevelCosts = targetLevels.reduce((previousCosts, currentTargetValue) => {
        const nextCosts = Array.from({ length: 256 }, () => Infinity);

        previousCosts.forEach((costFromPrevious, previousLevel) => {
            if (costFromPrevious === Infinity) {
                return;
            }

            modifierValues.forEach(modifierOffset => {
                let adjustedLevel = previousLevel + modifierOffset;
                adjustedLevel = Math.max(0, Math.min(255, adjustedLevel));

                const currentPenalty = costFromPrevious + Math.pow(currentTargetValue - adjustedLevel, 2);
                nextCosts[adjustedLevel] = Math.min(nextCosts[adjustedLevel], currentPenalty);
            });
        });
        return nextCosts;
    }, currentLevelCosts);

    const overallMinimum = Math.min(...finalLevelCosts);

    console.log(overallMinimum);
}
