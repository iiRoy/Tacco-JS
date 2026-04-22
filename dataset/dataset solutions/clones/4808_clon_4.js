function ProcessInput(rawText) {
    const segments = rawText.split('\n');

    segments.shift(); // Discard the first line (N)

    const initialDurations = segments.shift().split(' ').map(Number);

    segments.shift(); // Discard the third line (M)

    const adjustmentInstructions = segments.map(line => line.split(' ').map(Number));

    const computedOutcomes = adjustmentInstructions.map(instructionSet => {
        const targetIndex = instructionSet[0] - 1; // Convert to 0-based index
        const replacementDuration = instructionSet[1];

        // Create a temporary array to apply the current modification
        const temporaryDurations = initialDurations.slice(); // Shallow copy

        // Apply the specific modification for this instruction set
        temporaryDurations[targetIndex] = replacementDuration;

        // Sum the elements of the temporarily modified array
        return temporaryDurations.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
    });

    computedOutcomes.forEach(finalValue => console.log(finalValue));
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));