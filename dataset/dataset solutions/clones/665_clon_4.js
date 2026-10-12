const fs = require('fs');

const packet = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const shieldAmount = packet.shift();
const events = [];

for (let shield = 0; shield < shieldAmount; shield++) {
    const activationPoint = packet.shift();
    const deactivationPoint = packet.shift();

    events.push({
        coordinate: activationPoint,
        variation: 1,
    });

    events.push({
        coordinate: deactivationPoint,
        variation: -1,
    });
}

events.sort(
    (firstEvent, secondEvent) =>
        firstEvent.coordinate - secondEvent.coordinate
);

let activeShields = 0;
let previousCoordinate = events[0].coordinate;
let coveredTerritory = 0;
let eventIndex = 0;

while (eventIndex < events.length) {
    const currentCoordinate =
        events[eventIndex].coordinate;

    if (activeShields > 0) {
        coveredTerritory +=
            currentCoordinate - previousCoordinate;
    }

    let simultaneousVariation = 0;

    while (
        eventIndex < events.length &&
        events[eventIndex].coordinate === currentCoordinate
    ) {
        simultaneousVariation +=
            events[eventIndex].variation;

        eventIndex++;
    }

    activeShields += simultaneousVariation;
    previousCoordinate = currentCoordinate;
}

console.log(coveredTerritory);