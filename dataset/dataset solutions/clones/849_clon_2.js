const fileSystem = require('fs');

const numericObservations = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const meteorCount = numericObservations[0];
const brightnessLevels = numericObservations.slice(
    1,
    meteorCount + 1
);

const followingBrighterMeteor =
    new Array(meteorCount).fill(-1);

for (
    let currentMeteor = 0;
    currentMeteor < brightnessLevels.length;
    currentMeteor++
) {
    for (
        let futureMeteor = currentMeteor + 1;
        futureMeteor < brightnessLevels.length;
        futureMeteor++
    ) {
        if (
            brightnessLevels[futureMeteor] >
            brightnessLevels[currentMeteor]
        ) {
            followingBrighterMeteor[currentMeteor] =
                brightnessLevels[futureMeteor];

            break;
        }
    }
}

console.log(followingBrighterMeteor.join(' '));