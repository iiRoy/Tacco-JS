const fullScript = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const segmentList = fullScript.trim().split('\n');
let cursor = 0;

const conductAnalysis = () => {
    const dimensions = segmentList[cursor++].split(' ').map(Number);
    const countNodes = dimensions[0];
    const countTransmissions = dimensions[1];

    if (countNodes === 0 && countTransmissions === 0) {
        return;
    }

    const clearIndividuals = new Set();
    clearIndividuals.add(0); // Node 0 is initially free of affliction

    const transmissionEvents = [];
    for (let k = 0; k < countTransmissions; ++k) {
        const eventData = segmentList[cursor++].split(' ').map(Number);
        transmissionEvents.push({
            moment: eventData[0],
            transmitter: eventData[1] - 1,
            recipient: eventData[2] - 1
        });
    }

    transmissionEvents.sort((alpha, beta) => alpha.moment - beta.moment);

    transmissionEvents.forEach(event => {
        if (clearIndividuals.has(event.transmitter)) {
            clearIndividuals.add(event.recipient);
        }
    });

    console.log(clearIndividuals.size);

    conductAnalysis(); // Process the next scenario
};

conductAnalysis();