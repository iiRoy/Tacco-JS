class OverlapAnalyzer {
    constructor(dataPayload) {
        this.dataPayload = dataPayload;
    }

    #extractParameters() {
        const lineComponents = this.dataPayload.trim().split(/\r?\n/);
        const conceptualLength = Number(lineComponents[0]);
        const subjectSequence = lineComponents[1];
        return { conceptualLength, subjectSequence };
    }

    #mapCharacterBounds(sequence) {
        const boundsRegistry = new Map();
        for (let position = 0; position < sequence.length; ++position) {
            const currentSymbol = sequence[position];
            if (!boundsRegistry.has(currentSymbol)) {
                boundsRegistry.set(currentSymbol, { firstEncounter: position, lastEncounter: position });
            } else {
                boundsRegistry.get(currentSymbol).lastEncounter = position;
            }
        }
        return boundsRegistry;
    }

    #buildDifferenceArray(sequenceLength, characterBounds) {
        // Differential array for sweep line algorithm.
        // Size is sequenceLength + 1 to handle decrements for intervals ending at sequenceLength - 1.
        const differenceArray = new Array(sequenceLength + 1).fill(0);

        for (const bounds of characterBounds.values()) {
            differenceArray[bounds.firstEncounter]++;
            // The interval is inclusive [firstEncounter, lastEncounter].
            // So, the influence ends *after* lastEncounter, at lastEncounter + 1.
            if (bounds.lastEncounter + 1 <= sequenceLength) {
                differenceArray[bounds.lastEncounter + 1]--;
            }
        }
        return differenceArray;
    }

    #calculateMaxOverlap(differentialMetrics) {
        let currentOverlap = 0;
        let maximalOverlap = 0;

        // Iterate through the differential metrics up to the conceptual length.
        // The last element of differentialMetrics is for positions beyond the string.
        for (let idx = 0; idx < differentialMetrics.length - 1; ++idx) {
            currentOverlap += differentialMetrics[idx];
            if (currentOverlap > maximalOverlap) {
                maximalOverlap = currentOverlap;
            }
        }
        return maximalOverlap;
    }

    processSequence() {
        const { conceptualLength, subjectSequence } = this.#extractParameters();
        const characterBounds = this.#mapCharacterBounds(subjectSequence);
        const differentialMetrics = this.#buildDifferenceArray(conceptualLength, characterBounds);
        const maximalCoverage = this.#calculateMaxOverlap(differentialMetrics);
        return maximalCoverage;
    }
}

const performComputation = (inputString) => {
    const sequenceProcessor = new OverlapAnalyzer(inputString);
    const finalResult = sequenceProcessor.processSequence();
    // Output mechanism distinct from original
    (function renderOutput(value) {
        process.stdout.write(String(value));
    })(finalResult);
};

// Entry point for execution, using standard Node.js file system API
performComputation(require("node:fs").readFileSync("/dev/stdin", "utf8"));