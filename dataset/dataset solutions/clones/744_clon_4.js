const processInputLine = (lineContent) => {
    const segmentParts = lineContent.split(":");
    const componentKey = segmentParts[0];
    const dependentComponents = segmentParts[1].slice(0, -1).split(",");
    return [componentKey, dependentComponents];
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = rawInputData.trim().split("\n");

while (true) {
    const currentCaseCount = Number(dataLines.shift());
    if (currentCaseCount === 0) {
        break;
    }

    const [initialComponentKey, initialDependencies] = processInputLine(dataLines.shift());

    const discoveredComponents = new Set(initialDependencies);

    const componentGraph = new Map();
    for (let i = 0; i < currentCaseCount - 1; i++) {
        const [key, dependencies] = processInputLine(dataLines.shift());
        componentGraph.set(key, dependencies);
    }

    const explorationQueue = [...initialDependencies];
    let queuePointer = 0;

    while (queuePointer < explorationQueue.length) {
        const currentComponentIdentifier = explorationQueue[queuePointer++];
        
        if (componentGraph.has(currentComponentIdentifier)) {
            const directDependencies = componentGraph.get(currentComponentIdentifier);
            
            for (const subDependency of directDependencies) {
                if (!discoveredComponents.has(subDependency)) {
                    discoveredComponents.add(subDependency);
                    explorationQueue.push(subDependency);
                }
            }
        }
    }

    console.log(discoveredComponents.size);
}
