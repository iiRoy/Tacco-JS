function TokenStreamProcessor(textContent) {
    const extractedUnits = textContent.match(/\S+/g) || [];
    let currentPositionIndex = 0;

    const retrieveUnit = () => {
        if (currentPositionIndex < extractedUnits.length) {
            return extractedUnits[currentPositionIndex++];
        }
        return null;
    };

    return {
        grabNext: () => retrieveUnit(),
        grabNumericValue: () => {
            const val = retrieveUnit();
            return val !== null ? parseInt(val, 10) : null;
        },
        grabFloatingPoint: () => {
            const val = retrieveUnit();
            return val !== null ? parseFloat(val) : null;
        },
        grabByteRepresentation: () => {
            retrieveUnit();
            return null;
        }
    };
}

function SequenceHandler(dataSupplier) {
    const totalNodes = dataSupplier.grabNumericValue();
    let stepsToTake = dataSupplier.grabNumericValue();

    const transitionMappings = new Map();
    for (let k = 1; k <= totalNodes; ++k) {
        transitionMappings.set(k, dataSupplier.grabNumericValue());
    }

    let currentNodeState = 1;
    let visitedChronology = new Map();
    let simulationIteration = 0;
    
    let cycleDetected = false;
    let entryStepIndex = -1;
    let cycleSpan = -1;

    while (simulationIteration < totalNodes) {
        currentNodeState = transitionMappings.get(currentNodeState);
        if (visitedChronology.has(currentNodeState)) {
            cycleDetected = true;
            entryStepIndex = visitedChronology.get(currentNodeState);
            cycleSpan = simulationIteration - entryStepIndex;
            break;
        }
        visitedChronology.set(currentNodeState, simulationIteration);
        simulationIteration++;
    }

    if (cycleDetected) {
        const preCycleSegmentLength = entryStepIndex - 1; 
        stepsToTake = ((stepsToTake - preCycleSegmentLength) % cycleSpan) + preCycleSegmentLength;
    }

    let ultimateOutcome = 1;

    const traversePathRecursive = (startPoint, remainingHops) => {
        if (remainingHops === 0) {
            return startPoint;
        }
        const nextPoint = transitionMappings.get(startPoint);
        return traversePathRecursive(nextPoint, remainingHops - 1);
    };

    ultimateOutcome = traversePathRecursive(1, stepsToTake);

    console.log(ultimateOutcome);
}

const acquiredData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataInputMechanism = TokenStreamProcessor(acquiredData);
SequenceHandler(dataInputMechanism);