class InputProcessor {
    constructor(sourceLines) {
        this.lineQueue = sourceLines;
        this.currentPosition = 0;
    }

    retrieveNextItem() {
        if (this.currentPosition >= this.lineQueue.length) {
            throw new Error('End of input stream reached.');
        }
        return this.lineQueue[this.currentPosition++];
    }

    // Equivalent to nextInt()
    fetchNumericValue() {
        // Using unary plus for type conversion, alternative to parseInt
        return +this.retrieveNextItem();
    }

    // Equivalent to nextCharArray()
    fetchSymbolSequence() {
        // Using spread operator for character array, alternative to split('')
        return [...this.retrieveNextItem()];
    }
}

// Equivalent to myout()
const publishResult = (content) => {
    // Using console.log as the standard output method, but with a different name
    console.log(String(content));
};

// This global variable would be initialized by the external input handling system,
// similar to how 'obj' is initialized in the original boilerplate.
// Example: let inputProvider = new InputProcessor(['3', 'oxx']);
let inputProvider; 

// Equivalent to Main()
function processRingConfiguration() {
    const typeMapping = ['S', 'W']; // 0 for Sheep, 1 for Wolf

    const ringSize = inputProvider.fetchNumericValue();
    const observationReports = inputProvider.fetchSymbolSequence();

    // Four initial hypotheses for the first two entities (0-indexed)
    const startingConditions = [
        [0, 0], // S, S
        [0, 1], // S, W
        [1, 0], // W, S
        [1, 1]  // W, W
    ];

    for (const initialPair of startingConditions) {
        // Using Int8Array for efficiency and a different array type
        let deducedTypes = new Int8Array(ringSize + 2);
        deducedTypes[0] = initialPair[0];
        deducedTypes[1] = initialPair[1];

        // Propagate types around the ring based on observations
        for (let entityIndex = 0; entityIndex < ringSize; ++entityIndex) {
            const previousEntityState = deducedTypes[entityIndex];
            const currentEntityState = deducedTypes[entityIndex + 1];
            const currentObservation = observationReports[entityIndex];

            // Determine if the observation ('o' for same, 'x' for different) matches the entity states
            const observationImpliesSame = (currentObservation === 'o');
            const statesAreIdentical = (previousEntityState === currentEntityState);

            // Core logic: The type of the next entity (entityIndex + 2) is S (0) if
            // the observation's implication matches whether the previous two entities are identical.
            // Otherwise, it's W (1).
            deducedTypes[entityIndex + 2] = (observationImpliesSame === statesAreIdentical) ? 0 : 1;
        }

        // Validate the circular consistency:
        // The type derived for entity 'ringSize' must match the initial guess for entity '0'.
        // The type derived for entity 'ringSize + 1' must match the initial guess for entity '1'.
        if (deducedTypes[0] === deducedTypes[ringSize] && deducedTypes[1] === deducedTypes[ringSize + 1]) {
            // Solution found: extract the relevant part of the array and format
            const finalArrangement = Array.from(deducedTypes.subarray(0, ringSize))
                                        .map(binaryValue => typeMapping[binaryValue])
                                        .join('');
            publishResult(finalArrangement);
            return; // Exit the function immediately upon finding a valid solution
        }
    }

    // If no solution is found after trying all starting conditions
    publishResult(-1);
}