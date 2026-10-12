const STDIN_SOURCE = '/dev/stdin';
const fileContent = require('fs').readFileSync(STDIN_SOURCE, 'utf8');
const lines = fileContent.trim().split("\n");

let currentLineIndex = 0;

// Helper function to parse N and M from a line
function extractDimensions(lineString) {
    const parts = lineString.split(/\s+/).map(Number);
    return {
        numComputers: parts[0],
        numPackets: parts[1]
    };
}

// Helper function to parse individual packet data
function parsePacketDetails(lineString) {
    const parts = lineString.split(/\s+/).map(Number);
    // Adjusting sender and receiver IDs to be 0-indexed
    return {
        time: parts[0],
        sender: parts[1] - 1,
        receiver: parts[2] - 1
    };
}

while (true) {
    const currentDimensionLine = lines[currentLineIndex];
    currentLineIndex++;

    const { numComputers, numPackets } = extractDimensions(currentDimensionLine);

    if (numComputers === 0 && numPackets === 0) {
        break;
    }

    // Initialize infection status for all computers
    // true means infected, false means not infected
    const computerInfectionStatus = new Array(numComputers).fill(true);
    // Computer 0 is initially not infected
    computerInfectionStatus[0] = false;

    const transmissionRecords = [];
    for (let packetIdx = 0; packetIdx < numPackets; packetIdx++) {
        const packetLine = lines[currentLineIndex];
        currentLineIndex++;
        const { time, sender, receiver } = parsePacketDetails(packetLine);
        transmissionRecords.push([time, sender, receiver]);
    }

    // Sort transmissions.
    // IMPORTANT: This replicates the original's potentially quirky sort behavior.
    // In JavaScript, `[t1, s1, r1] - [t2, s2, r2]` results in `NaN`.
    // When `Array.prototype.sort` comparator returns `NaN`, elements are considered equal,
    // maintaining their relative order (stable sort). This means the original order of packets
    // is preserved, not necessarily sorted by time.
    transmissionRecords.sort(function (recordA, recordB) {
        return recordA - recordB;
    });

    // Process each transmission
    for (const currentTransmission of transmissionRecords) {
        const senderCompIdx = currentTransmission[1];
        const receiverCompIdx = currentTransmission[2];

        // If the sender is not infected, the receiver also becomes not infected
        if (!computerInfectionStatus[senderCompIdx]) {
            computerInfectionStatus[receiverCompIdx] = false;
        }
    }

    // Count the number of non-infected computers
    const totalNonInfected = computerInfectionStatus.reduce((count, isInfected) => {
        return isInfected ? count : count + 1;
    }, 0);

    console.log(totalNonInfected);
}
