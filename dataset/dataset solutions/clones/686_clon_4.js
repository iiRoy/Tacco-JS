const obtainSourceMaterial = require('node:fs').readFileSync;

const processAutomatonScenario = (scenarioLines, currentLineCursor, outcomeAccumulator) => {
    if (currentLineCursor >= scenarioLines.length) return outcomeAccumulator;

    const dimensionSpecification = scenarioLines[currentLineCursor++];
    if (dimensionSpecification === 'TERMINATE_SIMULATION_GLOBAL') return outcomeAccumulator;

    const bounds = dimensionSpecification.split(' ').map(val => parseInt(val, 10));
    const maximumXDimension = bounds[0];
    const maximumYDimension = bounds[1];

    let currentXLocation = 1;
    let currentYLocation = 1;
    let currentOrientationIndex = 0; // Represents internal directions 0, 1, 2, 3

    const directionalDisplacements = {
        [0]: { advance: { deltaX: 1, deltaY: 0 }, retract: { deltaX: -1, deltaY: 0 } },
        [1]: { advance: { deltaX: 0, deltaY: 1 }, retract: { deltaX: 0, deltaY: -1 } },
        [2]: { advance: { deltaX: -1, deltaY: 0 }, retract: { deltaX: 1, deltaY: 0 } },
        [3]: { advance: { deltaX: -1, deltaY: 0 }, retract: { deltaX: 0, deltaY: 1 } }
    };

    const commandExecutionMap = {
        'ROTATE_CLOCKWISE_STEP': () => {
            currentOrientationIndex = (currentOrientationIndex + 1) % 4;
        },
        'ROTATE_COUNTERCLOCKWISE_STEP': () => {
            currentOrientationIndex = (currentOrientationIndex + 3) % 4;
        },
        'MOVE_FORWARD_STEPS': (steps) => {
            for (let s = 0; s < steps; s++) {
                currentXLocation += directionalDisplacements[currentOrientationIndex].advance.deltaX;
                currentYLocation += directionalDisplacements[currentOrientationIndex].advance.deltaY;
            }
        },
        'MOVE_BACKWARD_STEPS': (steps) => {
            for (let s = 0; s < steps; s++) {
                currentXLocation += directionalDisplacements[currentOrientationIndex].retract.deltaX;
                currentYLocation += directionalDisplacements[currentOrientationIndex].retract.deltaY;
            }
        }
    };

    const processSingleDirective = (directiveIndex) => {
        const rawDirective = scenarioLines[directiveIndex];
        const directiveComponents = rawDirective.split(' ');
        const primaryDirective = directiveComponents[0];
        let directiveQuantity = directiveComponents.length === 2 ? parseInt(directiveComponents[1], 10) : 1;

        if (primaryDirective === 'END_CURRENT_SEQUENCE') {
            currentLineCursor = directiveIndex + 1; // Update cursor for the next scenario
            return;
        }

        const handler = commandExecutionMap[primaryDirective];
        if (handler) {
            handler(directiveQuantity);
        }

        currentXLocation = Math.max(1, Math.min(maximumXDimension, currentXLocation));
        currentYLocation = Math.max(1, Math.min(maximumYDimension, currentYLocation));
        
        processSingleDirective(directiveIndex + 1); // Recurse for the next directive
    };

    processSingleDirective(currentLineCursor); // Initiate directive processing for this scenario

    outcomeAccumulator.push(`${currentYLocation} ${currentXLocation}`);
    return processAutomatonScenario(scenarioLines, currentLineCursor, outcomeAccumulator); // Recurse for the next scenario
};

const rawTextData = obtainSourceMaterial('/dev/stdin', 'utf8');
const allInputLines = rawTextData.trim().split('\n');

const modifiedInputLines = allInputLines.map(line => {
    if (line === '0 0') return 'TERMINATE_SIMULATION_GLOBAL';
    if (line === 'STOP') return 'END_CURRENT_SEQUENCE';
    if (line.includes('RIGHT')) return line.replace('RIGHT', 'ROTATE_CLOCKWISE_STEP');
    if (line.includes('LEFT')) return line.replace('LEFT', 'ROTATE_COUNTERCLOCKWISE_STEP');
    if (line.includes('FORWARD')) return line.replace('FORWARD', 'MOVE_FORWARD_STEPS');
    if (line.includes('BACKWARD')) return line.replace('BACKWARD', 'MOVE_BACKWARD_STEPS');
    return line;
});

const finalResultsCollection = processAutomatonScenario(modifiedInputLines, 0, []);
console.log(finalResultsCollection.join('\n'));