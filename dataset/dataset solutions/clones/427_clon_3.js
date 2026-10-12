const fs = require('fs');

function readTerrain() {
    const values = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const size = values.shift();

    return values.slice(0, size);
}

function buildWesternBarriers(towers) {
    const barriers = [];
    let tallestTower = 0;

    for (const tower of towers) {
        tallestTower = Math.max(tallestTower, tower);
        barriers.push(tallestTower);
    }

    return barriers;
}

function buildEasternBarriers(towers) {
    const barriers = new Array(towers.length);
    let tallestTower = 0;
    let position = towers.length - 1;

    while (position >= 0) {
        tallestTower = Math.max(
            tallestTower,
            towers[position]
        );

        barriers[position] = tallestTower;
        position--;
    }

    return barriers;
}

function calculateDustByCrater(towers) {
    const westernBarriers = buildWesternBarriers(towers);
    const easternBarriers = buildEasternBarriers(towers);

    return towers.map((tower, position) => {
        const maximumLevel = Math.min(
            westernBarriers[position],
            easternBarriers[position]
        );

        if (tower >= maximumLevel) {
            return 0;
        }

        return maximumLevel - tower;
    });
}

const lunarTerrain = readTerrain();
const dustInCraters = calculateDustByCrater(lunarTerrain);

const totalDust = dustInCraters.reduce(
    (total, currentCrater) => total + currentCrater,
    0
);

process.stdout.write(`${totalDust}\n`);