const fs = require('fs');
const inputData = fs.readFileSync('/dev/stdin', 'utf8').trim();
const rawLines = inputData.split('\n');

function* lineParser(lines) {
    let currentIdx = 0;
    while (currentIdx < lines.length) {
        yield lines[currentIdx++].split(/\s+/).map(Number);
    }
}

const lineStream = lineParser(rawLines);

let currentCaseParams;
while ((currentCaseParams = lineStream.next().value) && (currentCaseParams[0] !== 0 || currentCaseParams[1] !== 0)) {
    const totalPeople = currentCaseParams[0];
    const eventCount = currentCaseParams[1];

    const immuneRegistry = new Set();
    immuneRegistry.add(0); // Individual 0 is initially not infected

    const transmissionRecords = Array.from({ length: eventCount }, () => {
        const record = lineStream.next().value;
        return [record[0], record[1] - 1, record[2] - 1]; // [timestamp, senderId, receiverId]
    });

    transmissionRecords.sort((recA, recB) => recA[0] - recB[0]);

    for (const recordEntry of transmissionRecords) {
        const [_, senderId, receiverId] = recordEntry;
        if (immuneRegistry.has(senderId)) {
            immuneRegistry.add(receiverId);
        }
    }

    console.log(immuneRegistry.size);
}
