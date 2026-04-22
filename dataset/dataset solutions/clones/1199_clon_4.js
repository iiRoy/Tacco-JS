const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

const transformationSchemes = {
    "N": { up: 'front', front: 'down', back: 'up', down: 'back' },
    "S": { up: 'back', front: 'up', back: 'down', down: 'front' },
    "E": { up: 'left', right: 'up', left: 'down', down: 'right' },
    "W": { up: 'right', right: 'down', left: 'up', down: 'left' }
};

const performTranslation = (currentLayout, directionIndicator) => {
    const nextLayout = new Map(currentLayout);
    const scheme = transformationSchemes[directionIndicator];
    for (const [newPanel, oldPanel] of Object.entries(scheme)) {
        nextLayout.set(newPanel, currentLayout.get(oldPanel));
    }
    return nextLayout;
};

const rotationScheme = { front: 'left', right: 'front', back: 'right', left: 'back' };

const spinAroundAxis = (currentLayout) => {
    const nextLayout = new Map(currentLayout);
    for (const [newPanel, oldPanel] of Object.entries(rotationScheme)) {
        nextLayout.set(newPanel, currentLayout.get(oldPanel));
    }
    return nextLayout;
};

const catalogConfigurations = (initialLayout, masterCollection) => {
    let currentLayout = initialLayout;
    const localCollection = new Set();
    let collisionFlag = false;

    Array.from({ length: 4 }).forEach(() => {
        const stringRepresentation = Array.from(currentLayout.values()).join(',');
        if (masterCollection.has(stringRepresentation)) {
            collisionFlag = true;
        }
        localCollection.add(stringRepresentation);
        currentLayout = spinAroundAxis(currentLayout);
    });

    if (collisionFlag) {
        return true;
    } else {
        localCollection.forEach(item => masterCollection.add(item));
        return false;
    }
};

const processedSegments = dataStream.trim().split("\n");
const quantityBlocks = parseInt(processedSegments.shift(), 10);

const globalRegistry = new Set();
let finalOutcome = 'AFFIRMATIVE';

processedSegments.some(segmentLine => {
    const numericFacings = segmentLine.split(" ").map(Number);
    let activeBlock = new Map([
        ["up", numericFacings[0]],
        ["front", numericFacings[1]],
        ["right", numericFacings[2]],
        ["left", numericFacings[3]],
        ["back", numericFacings[4]],
        ["down", numericFacings[5]]
    ]);

    const phaseOneCollision = Array.from({ length: 4 }).some(() => {
        const collision = catalogConfigurations(activeBlock, globalRegistry);
        activeBlock = performTranslation(activeBlock, "N");
        return collision;
    });
    if (phaseOneCollision) { finalOutcome = 'NEGATIVE'; return true; }

    activeBlock = performTranslation(activeBlock, "E");
    if (catalogConfigurations(activeBlock, globalRegistry)) { finalOutcome = 'NEGATIVE'; return true; }

    activeBlock = performTranslation(activeBlock, "S");
    activeBlock = performTranslation(activeBlock, "S");
    if (catalogConfigurations(activeBlock, globalRegistry)) { finalOutcome = 'NEGATIVE'; return true; }

    return false;
});

console.log(finalOutcome);