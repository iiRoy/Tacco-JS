const STDIN_PATH = '/dev/stdin';
const fileContent = require('fs').readFileSync(STDIN_PATH, 'utf8');
const lines = fileContent.trim().split("\n");
let currentLineIndex = 0;

while (true) {
    const currentDimensions = lines[currentLineIndex].split(" ").map(Number);
    currentLineIndex++;

    const numPeople = currentDimensions[0];
    const numPackets = currentDimensions[1];

    if (numPeople === 0 && numPackets === 0) {
        break;
    }

    // Invert logic: isHealthy[i] = true means person i is healthy, false means infected
    const isHealthy = Array(numPeople).fill(false); // Initially, everyone is infected (not healthy)
    isHealthy[0] = true; // Person 0 is healthy

    const packetTransmissions = [];
    for (let i = 0; i < numPackets; i++) {
        const transmissionData = lines[currentLineIndex].split(" ").map(Number);
        currentLineIndex++;
        // Store time, sender (0-indexed), receiver (0-indexed)
        packetTransmissions.push([transmissionData[0], transmissionData[1] - 1, transmissionData[2] - 1]);
    }

    // Sort transmissions by time
    packetTransmissions.sort((a, b) => a[0] - b[0]);

    // Process transmissions
    for (const transmission of packetTransmissions) {
        const senderIndex = transmission[1];
        const receiverIndex = transmission[2];

        // If the sender is healthy, the receiver also becomes healthy
        if (isHealthy[senderIndex]) {
            isHealthy[receiverIndex] = true;
        }
    }

    let healthyCount = 0;
    // Count the number of healthy people
    for (const personStatus of isHealthy) {
        if (personStatus) { // If true, the person is healthy
            healthyCount++;
        }
    }
    console.log(healthyCount);
}
