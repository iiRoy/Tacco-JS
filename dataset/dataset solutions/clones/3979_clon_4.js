((inputContent) => {
    const dataLines = inputContent.trim().split('\n');
    const totalPoints = parseInt(dataLines[0], 10);

    const crimsonPoints = [];
    const sapphirePoints = [];

    for (let k = 1; k <= totalPoints; k++) {
        const [xCoord, yCoord] = dataLines[k].split(' ').map(Number);
        crimsonPoints.push({ x: xCoord, y: yCoord });
    }
    for (let k = totalPoints + 1; k <= 2 * totalPoints; k++) {
        const [xCoord, yCoord] = dataLines[k].split(' ').map(Number);
        sapphirePoints.push({ x: xCoord, y: yCoord });
    }

    sapphirePoints.sort((ptA, ptB) => ptB.x - ptA.x);

    crimsonPoints.sort((ptA, ptB) => ptB.y - ptA.y);

    let successfulMatches = 0;
    const crimsonAvailability = new Array(crimsonPoints.length).fill(true);

    for (const currentSapphire of sapphirePoints) {
        const currentSapphireX = currentSapphire.x;
        const currentSapphireY = currentSapphire.y;

        let matchedCrimsonIndex = -1;

        for (let crimsonIdx = 0; crimsonIdx < crimsonPoints.length; crimsonIdx++) {
            if (!crimsonAvailability[crimsonIdx]) {
                continue;
            }

            const candidateCrimson = crimsonPoints[crimsonIdx];
            const candidateCrimsonX = candidateCrimson.x;
            const candidateCrimsonY = candidateCrimson.y;

            if (candidateCrimsonX < currentSapphireX && candidateCrimsonY < currentSapphireY) {
                matchedCrimsonIndex = crimsonIdx;
                break;
            }
        }

        if (matchedCrimsonIndex !== -1) {
            crimsonAvailability[matchedCrimsonIndex] = false;
            successfulMatches++;
        }
    }

    console.log(`${successfulMatches}`);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
