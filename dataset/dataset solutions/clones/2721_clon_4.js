function transformInputData(sourceData) {
    const contentLines = sourceData.trim().split("\n");
    const [elementCountStr, iterationCountStr] = contentLines[0].split(" ");
    const elementList = contentLines[1].split(" ");
    return {
        elementQuantity: Number(elementCountStr),
        totalIterations: Number(iterationCountStr),
        sourceElements: elementList
    };
}

class SequenceManager {
    constructor() {
        this.currentElements = [];
    }

    incorporateElement(itemValue) {
        const existingPosition = this.currentElements.indexOf(itemValue);
        if (existingPosition !== -1) {
            this.currentElements.splice(existingPosition); // Truncate from the found position
        } else {
            this.currentElements.push(itemValue);
        }
    }

    retrieveCurrentState() {
        return this.currentElements.join(" ");
    }
}

function determineFinalSequence(processedPayload) {
    const { elementQuantity: numElements, totalIterations: maxCycles, sourceElements: dataItems } = processedPayload;

    let managerInstance = new SequenceManager();
    const stateChronicle = new Map(); // Maps state string to the cycle number it was first observed
    const chronologicalStates = []; // Stores state strings in order of observation

    let currentCycle = 0;
    let cycleBeginIndex = -1;
    let cycleEndIndex = -1;

    // Record the initial state (before any processing, "cycle 0")
    chronologicalStates.push(managerInstance.retrieveCurrentState());
    stateChronicle.set(managerInstance.retrieveCurrentState(), 0);

    while (currentCycle < maxCycles) {
        currentCycle++; // Advance to the next cycle

        // Apply all source elements to the manager instance
        for (const item of dataItems) {
            managerInstance.incorporateElement(item);
        }

        const currentStateRepresentation = managerInstance.retrieveCurrentState();

        if (stateChronicle.has(currentStateRepresentation)) {
            cycleBeginIndex = stateChronicle.get(currentStateRepresentation);
            cycleEndIndex = currentCycle; // This cycle's state is a repeat
            break;
        }

        stateChronicle.set(currentStateRepresentation, currentCycle);
        chronologicalStates.push(currentStateRepresentation);
    }

    if (cycleBeginIndex === -1) { // No cycle detected, completed all maxCycles
        return chronologicalStates[maxCycles];
    } else { // A cycle was found
        const cycleDuration = cycleEndIndex - cycleBeginIndex;
        const cyclesRemaining = maxCycles - cycleBeginIndex;
        const offsetWithinCycle = cyclesRemaining % cycleDuration;
        const finalStateLookupIndex = cycleBeginIndex + offsetWithinCycle;
        return chronologicalStates[finalStateLookupIndex];
    }
}

function processExternalInput(rawDataContent) {
    const transformedInput = transformInputData(rawDataContent);
    const finalOutcome = determineFinalSequence(transformedInput);
    console.log(finalOutcome);
}

processExternalInput(require("fs").readFileSync("/dev/stdin", "utf8"));