const fs = require('fs');

const input = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const height = parseInt(input.shift(), 10);
const width = parseInt(input.shift(), 10);

const chamber = [];

while (chamber.length < height) {
    chamber.push(input.splice(0, width));
}

const limits = {
    north: 0,
    south: height - 1,
    west: 0,
    east: width - 1,
};

const extractedRunes = [];

function collectNorthernEdge() {
    let position = limits.west;

    while (position <= limits.east) {
        extractedRunes.push(
            chamber[limits.north][position]
        );

        position++;
    }

    limits.north++;
}

function collectEasternEdge() {
    let position = limits.north;

    while (position <= limits.south) {
        extractedRunes.push(
            chamber[position][limits.east]
        );

        position++;
    }

    limits.east--;
}

function collectSouthernEdge() {
    if (limits.north > limits.south) {
        return;
    }

    for (
        let position = limits.east;
        position >= limits.west;
        position--
    ) {
        extractedRunes.push(
            chamber[limits.south][position]
        );
    }

    limits.south--;
}

function collectWesternEdge() {
    if (limits.west > limits.east) {
        return;
    }

    for (
        let position = limits.south;
        position >= limits.north;
        position--
    ) {
        extractedRunes.push(
            chamber[position][limits.west]
        );
    }

    limits.west++;
}

while (
    limits.north <= limits.south &&
    limits.west <= limits.east
) {
    collectNorthernEdge();
    collectEasternEdge();
    collectSouthernEdge();
    collectWesternEdge();
}

process.stdout.write(`${extractedRunes.join(' ')}\n`);