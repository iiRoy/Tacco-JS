const retrieveSourceText = () => {
    const fileIO = require('fs');
    return fileIO.readFileSync('/dev/stdin', 'utf8');
};

const rawLines = retrieveSourceText().split('\n');

const dimensionsLine = rawLines.shift().split(' ').map(Number);
const initialNodeCount = dimensionsLine[0];
const constraintCount = dimensionsLine[1];

const constraintList = rawLines.slice(0, constraintCount).map(lineText => {
    const segments = lineText.split(' ').map(Number);
    return {
        startVertex: segments[0],
        endVertex: segments[1],
        differenceValue: segments[2]
    };
});

let componentData = new Map();

const findComponentRoot = (vertexId) => {
    if (!componentData.has(vertexId)) {
        componentData.set(vertexId, { parentId: vertexId, relativeOffset: 0 });
    }

    let record = componentData.get(vertexId);

    if (record.parentId === vertexId) {
        return [vertexId, 0];
    }

    const [ultimateRootId, offsetFromParent] = findComponentRoot(record.parentId);
    record.relativeOffset += offsetFromParent;
    record.parentId = ultimateRootId;
    return [ultimateRootId, record.relativeOffset];
};

let inconsistencyDetected = false;

for (const currentConstraint of constraintList) {
    const { startVertex, endVertex, differenceValue } = currentConstraint;

    const [rootOfStart, offsetToStartRoot] = findComponentRoot(startVertex);
    const [rootOfEnd, offsetToEndRoot] = findComponentRoot(endVertex);

    if (rootOfStart === rootOfEnd) {
        if (offsetToEndRoot - offsetToStartRoot !== differenceValue) {
            inconsistencyDetected = true;
            break;
        }
    } else {
        componentData.get(rootOfStart).parentId = rootOfEnd;
        componentData.get(rootOfStart).relativeOffset = offsetToEndRoot - offsetToStartRoot - differenceValue;
    }
}

const finalOutcome = inconsistencyDetected ? 'No' : 'Yes';
process.stdout.write(finalOutcome + '\n');