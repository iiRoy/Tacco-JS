const rawSource = require('node:fs').readFileSync(0, 'utf8');
const lineSegments = rawSource.trim().split('\n');

const missionPlans = [];
let segmentPointer = 0;

while (segmentPointer < lineSegments.length) {
    const fieldDimensions = lineSegments[segmentPointer++];
    if (fieldDimensions === '0 0') {
        break;
    }

    const [maxXExtent, maxYExtent] = fieldDimensions.split(' ').map(Number);
    const directives = [];
    while (segmentPointer < lineSegments.length) {
        const directiveLine = lineSegments[segmentPointer++];
        const commandTokens = directiveLine.split(' ');
        const actionType = commandTokens[0];
        if (actionType === 'STOP') {
            break;
        }
        directives.push({
            operation: actionType,
            magnitude: commandTokens.length > 1 ? Number(commandTokens[1]) : 0
        });
    }
    missionPlans.push({
        zoneWidth: maxXExtent,
        zoneHeight: maxYExtent,
        actionsList: directives
    });
}

const resultCoordinates = [];

// Define movement vectors based on original code's behavior
// 0: North, 1: East, 2: South, 3: West
const advanceVectors = [
    { deltaX: 0, deltaY: 1 },  // North: Y increases
    { deltaX: 1, deltaY: 0 },  // East: X increases
    { deltaX: 0, deltaY: -1 }, // South: Y decreases
    { deltaX: 0, deltaY: -1 }  // West: Y decreases (replicating original's specific behavior)
];

const retreatVectors = [
    { deltaX: 0, deltaY: -1 }, // North: Y decreases
    { deltaX: -1, deltaY: 0 }, // East: X decreases
    { deltaX: 0, deltaY: 1 },  // South: Y increases
    { deltaX: 1, deltaY: 0 }   // West: X increases (replicating original's specific behavior)
];

for (const currentPlan of missionPlans) {
    let robotPositionX = 1;
    let robotPositionY = 1;
    let robotOrientationIndex = 0; // 0: N, 1: E, 2: S, 3: W

    const currentZoneWidth = currentPlan.zoneWidth;
    const currentZoneHeight = currentPlan.zoneHeight;

    for (const currentDirective of currentPlan.actionsList) {
        switch (currentDirective.operation) {
            case 'RIGHT':
                robotOrientationIndex = (robotOrientationIndex + 1) % 4;
                break;
            case 'LEFT':
                robotOrientationIndex = (robotOrientationIndex - 1 + 4) % 4;
                break;
            case 'FORWARD':
                {
                    const motionVector = advanceVectors[robotOrientationIndex];
                    robotPositionX += motionVector.deltaX * currentDirective.magnitude;
                    robotPositionY += motionVector.deltaY * currentDirective.magnitude;
                }
                break;
            case 'BACKWARD':
                {
                    const motionVector = retreatVectors[robotOrientationIndex];
                    robotPositionX += motionVector.deltaX * currentDirective.magnitude;
                    robotPositionY += motionVector.deltaY * currentDirective.magnitude;
                }
                break;
        }

        // Clamp coordinates within boundaries
        robotPositionX = Math.max(1, Math.min(currentZoneWidth, robotPositionX));
        robotPositionY = Math.max(1, Math.min(currentZoneHeight, robotPositionY));
    }
    resultCoordinates.push(`${robotPositionX} ${robotPositionY}`);
}

console.log(resultCoordinates.join('\n'));