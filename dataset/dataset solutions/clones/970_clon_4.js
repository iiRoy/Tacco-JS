const sourceData = process.stdin.readFileSync(0, 'utf8');
const lineComponents = sourceData.split('\n');
const primaryTarget = lineComponents[0];
const secondaryTarget = lineComponents[1];

const collectedIndices = [];
let currentSearchPosition = 0;
let nextMatchLocation;

if (secondaryTarget.length === 0) {
    for (let currentPoint = 0; currentPoint <= primaryTarget.length; ++currentPoint) {
        collectedIndices.push(currentPoint);
    }
} else {
    for (;;) {
        nextMatchLocation = primaryTarget.indexOf(secondaryTarget, currentSearchPosition);

        if (nextMatchLocation === -1) {
            break;
        }

        collectedIndices.push(nextMatchLocation);
        currentSearchPosition = nextMatchLocation + 1;
    }
}

if (collectedIndices.length > 0) {
    process.stdout.write(collectedIndices.join('\n'));
}