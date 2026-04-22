const acquireData = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const sourceContent = acquireData();
const contentLines = sourceContent.trim().split('\n');
let currentSegmentPointer = 0;
const outcomeAccumulator = [];

while (true) {
    const dimensionInfo = contentLines[currentSegmentPointer++].split(' ').map(Number);
    const domainSize = dimensionInfo[0];
    const relationCount = dimensionInfo[1];

    if (domainSize === 0 && relationCount === 0) {
        break;
    }

    const causalEvents = [];
    for (let k = 0; k < relationCount; k++) {
        const eventData = contentLines[currentSegmentPointer++].split(' ').map(Number);
        causalEvents.push({
            sequence: eventData[0],
            origin: eventData[1] - 1,
            terminus: eventData[2] - 1
        });
    }

    const influencedUnits = new Set([0]);

    causalEvents.sort((eventA, eventB) => eventA.sequence - eventB.sequence);

    for (const currentEvent of causalEvents) {
        if (influencedUnits.has(currentEvent.origin)) {
            influencedUnits.add(currentEvent.terminus);
        }
    }
    outcomeAccumulator.push(influencedUnits.size);
}

outcomeAccumulator.forEach(resultValue => console.log(resultValue));