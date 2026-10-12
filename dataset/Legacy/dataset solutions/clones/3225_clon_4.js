function processInput(rawData) {
    const lines = rawData.split('\n');
    const [firstLineData, secondLineData] = lines;

    const [countA, countB] = firstLineData.split(' ').map(Number);
    let itemPositions = secondLineData.split(' ').map(Number);

    itemPositions.sort((val1, val2) => val1 - val2);

    const positionDifferences = itemPositions.slice(1).map((currentPos, index) => currentPos - itemPositions[index]);

    const gapsToRetain = Math.max(0, countB - countA);

    if (gapsToRetain === 0) {
        console.log(0);
        return;
    }

    positionDifferences.sort((d1, d2) => d1 - d2);

    const totalDistance = positionDifferences.slice(0, gapsToRetain).reduce((accumulator, currentDiff) => accumulator + currentDiff, 0);

    console.log(totalDistance);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
