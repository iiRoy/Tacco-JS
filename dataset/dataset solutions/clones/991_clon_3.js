const fs = require('fs');

function receiveTowerBlueprint() {
    const measurements = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const declaredTowers = measurements.shift();

    return measurements.slice(0, declaredTowers);
}

function calculateBestPanelFrom(towers, beginning) {
    let shortestTower = towers[beginning];
    let bestLocalArea = 0;
    let ending = beginning;

    while (ending < towers.length) {
        if (towers[ending] < shortestTower) {
            shortestTower = towers[ending];
        }

        const occupiedTowers = ending - beginning + 1;
        const candidateArea =
            shortestTower * occupiedTowers;

        if (candidateArea > bestLocalArea) {
            bestLocalArea = candidateArea;
        }

        ending++;
    }

    return bestLocalArea;
}

function determinePanelArea(towers) {
    let answer = 0;
    let beginning = 0;

    while (beginning < towers.length) {
        const localArea = calculateBestPanelFrom(
            towers,
            beginning
        );

        if (localArea > answer) {
            answer = localArea;
        }

        beginning++;
    }

    return answer;
}

const orbitalTowers = receiveTowerBlueprint();

process.stdout.write(
    `${determinePanelArea(orbitalTowers)}\n`
);