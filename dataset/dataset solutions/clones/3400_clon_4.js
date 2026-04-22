const getRawInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const extractProcessedData = (rawText) => {
    const textLines = rawText.split('\n');
    const entryCount = parseInt(textLines[0], 10);
    const levelSequence = textLines[1].split(' ').map(Number);
    return { entryCount, levelSequence };
};

class DynamicStructureController {
    #segmentUnits;
    #operationPhase;
    #cycleMarker;

    constructor(initialLevel) {
        this.#segmentUnits = Array(initialLevel).fill(1);
        this.#operationPhase = 0;
        this.#cycleMarker = 1;
    }

    #transitionPhaseOnVerification() {
        if (this.#operationPhase === 2) {
            const firstUnit = this.#segmentUnits.length > 0 ? this.#segmentUnits[0] : null;
            const allUnitsIdentical = this.#segmentUnits.every(unit => unit === firstUnit);
            this.#operationPhase = allUnitsIdentical ? 0 : 1;
        }
    }

    #handleLevelIncrease(previousDepth, currentDepth) {
        const unitsToAdd = currentDepth - previousDepth;
        this.#segmentUnits.push(...Array(unitsToAdd).fill(1));
        if (this.#operationPhase !== 0) {
            this.#operationPhase = 1;
        }
    }

    #handleLevelDecreaseStandard(currentDepth) {
        this.#segmentUnits[currentDepth - 1] = (this.#segmentUnits[currentDepth - 1] || 0) + 1;
        this.#segmentUnits = this.#segmentUnits.slice(0, currentDepth);
        if (this.#segmentUnits.length !== 1) {
            this.#operationPhase = 1;
            this.#cycleMarker++;
        }
    }

    #handleLevelDecreaseResetIncrement(currentDepth) {
        this.#segmentUnits = this.#segmentUnits.slice(0, currentDepth);
        for (let k = currentDepth - 1; k >= 0; k--) {
            if (this.#segmentUnits[k] === this.#cycleMarker) {
                this.#segmentUnits[k] = 1;
            } else {
                this.#segmentUnits[k]++;
                this.#operationPhase = 2;
                break;
            }
        }
    }

    processLevelTransition(previousDepth, currentDepth) {
        this.#transitionPhaseOnVerification();

        if (currentDepth > previousDepth) {
            this.#handleLevelIncrease(previousDepth, currentDepth);
        } else {
            switch (this.#operationPhase) {
                case 0:
                    this.#handleLevelDecreaseStandard(currentDepth);
                    break;
                case 1:
                    this.#handleLevelDecreaseResetIncrement(currentDepth);
                    break;
            }
        }
    }

    retrieveMaximumUnitValue() {
        return this.#segmentUnits.length > 0 ? Math.max(...this.#segmentUnits) : 0;
    }
}

const orchestrateCalculation = (inputPayload) => {
    const { entryCount, levelSequence } = extractProcessedData(inputPayload);

    if (entryCount === 0 || levelSequence.length === 0) {
        return 0;
    }

    const sequenceManipulator = new DynamicStructureController(levelSequence[0]);

    for (let i = 1; i < entryCount; i++) {
        sequenceManipulator.processLevelTransition(levelSequence[i - 1], levelSequence[i]);
    }

    return sequenceManipulator.retrieveMaximumUnitValue();
};

const executionOutcome = orchestrateCalculation(getRawInput());
console.log(executionOutcome);