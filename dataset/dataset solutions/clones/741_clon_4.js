const acquireRawMaterial = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const analyzeConnectionScheme = (lineStreamReference) => {
    const unitCountRaw = lineStreamReference.shift();
    const unitCount = parseInt(unitCountRaw, 10);

    if (unitCount === 0) {
        return null;
    }

    const initialElementsLine = lineStreamReference.shift();
    const initialElementNames = initialElementsLine.split(':')[1].slice(0, -1).split(',');

    const elementState = new Map();
    const explorationQueue = [];

    initialElementNames.forEach(name => {
        if (!elementState.has(name)) {
            elementState.set(name, true);
            explorationQueue.push(name);
        }
    });

    const componentDependencies = new Map();
    for (let i = 0; i < unitCount - 1; ++i) {
        const dependencyLine = lineStreamReference.shift();
        const parts = dependencyLine.split(':');
        componentDependencies.set(
            parts[0],
            parts[1].slice(0, -1).split(',')
        );
    }

    let queueHead = 0;
    while (queueHead < explorationQueue.length) {
        const currentComponent = explorationQueue[queueHead];
        queueHead++;

        if (componentDependencies.has(currentComponent)) {
            elementState.set(currentComponent, false);

            const linkedComponents = componentDependencies.get(currentComponent);
            for (const linked of linkedComponents) {
                if (!elementState.has(linked)) {
                    elementState.set(linked, true);
                    explorationQueue.push(linked);
                }
            }
        }
    }

    let finalActiveCount = 0;
    for (const status of elementState.values()) {
        if (status === true) {
            finalActiveCount++;
        }
    }

    return finalActiveCount;
};

const initiateProcessing = () => {
    const rawDataContent = acquireRawMaterial();
    const splitLines = rawDataContent.trim().split('\n');
    let currentLineIndex = 0;

    const lineConsumer = {
        shift: () => {
            if (currentLineIndex < splitLines.length) {
                return splitLines[currentLineIndex++];
            }
            return undefined;
        }
    };

    let calculatedResult;
    const collectedResults = [];

    while ((calculatedResult = analyzeConnectionScheme(lineConsumer)) !== null) {
        collectedResults.push(calculatedResult);
    }

    collectedResults.forEach(result => console.log(result));
};

initiateProcessing();