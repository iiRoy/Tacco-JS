const fileSystem = require('fs');

const observations = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const colorCount = Number(observations[0]);

const northernRecord = observations.slice(
    1,
    colorCount + 1
);

const southernRecord = observations.slice(
    colorCount + 1,
    2 * colorCount + 1
);

let sameDragonPattern = false;

for (
    let startingPoint = 0;
    startingPoint < colorCount;
    startingPoint++
) {
    let recordsMatch = true;

    for (
        let colorPosition = 0;
        colorPosition < colorCount;
        colorPosition++
    ) {
        const circularPosition =
            (colorPosition + startingPoint) % colorCount;

        if (
            northernRecord[circularPosition] !==
            southernRecord[colorPosition]
        ) {
            recordsMatch = false;
            break;
        }
    }

    if (recordsMatch) {
        sameDragonPattern = true;
        break;
    }
}

console.log(
    sameDragonPattern
        ? 'CICLO EQUIVALENTE'
        : 'CICLO DIFERENTE'
);