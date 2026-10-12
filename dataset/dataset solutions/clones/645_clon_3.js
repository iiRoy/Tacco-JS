const fs = require('fs');

function readDragonRecords() {
    const input = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/);

    const cycleLength = parseInt(input.shift(), 10);

    return {
        length: cycleLength,
        first: input.splice(0, cycleLength),
        second: input.splice(0, cycleLength),
    };
}

function rotateColors(colors, startingPosition) {
    const endingFragment = colors.slice(startingPosition);
    const beginningFragment = colors.slice(0, startingPosition);

    return endingFragment.concat(beginningFragment);
}

function cyclesAreEqual(first, second) {
    if (first.length !== second.length) {
        return false;
    }

    return first.every(
        (color, position) => color === second[position]
    );
}

function findMatchingRotation(firstRecord, secondRecord) {
    let rotation = 0;

    while (rotation < firstRecord.length) {
        const rotatedRecord = rotateColors(
            firstRecord,
            rotation
        );

        if (cyclesAreEqual(rotatedRecord, secondRecord)) {
            return rotation;
        }

        rotation++;
    }

    return -1;
}

const dragonRecords = readDragonRecords();

const matchingPosition = findMatchingRotation(
    dragonRecords.first,
    dragonRecords.second
);

process.stdout.write(
    matchingPosition !== -1
        ? 'CICLO EQUIVALENTE\n'
        : 'CICLO DIFERENTE\n'
);