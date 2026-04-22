function Main(entireInput) {
    const linesOfText = entireInput.split('\n');
    const patternString = linesOfText[1];
    const sequenceLength = patternString.length;

    const indicators = Array.from(patternString, (symbol) => symbol === 'x'); // true for 'x' (wolf observation), false for 'o' (sheep observation)

    const startConfigurations = [
        [false, false], // Initial two animals are SS (false=S, true=W)
        [false, true],  // SW
        [true, false],  // WS
        [true, true]    // WW
    ];

    for (let currentConfigIndex = 0; currentConfigIndex < startConfigurations.length; ++currentConfigIndex) {
        const initialEntityOne = startConfigurations[currentConfigIndex][0];
        const initialEntityTwo = startConfigurations[currentConfigIndex][1];

        const generatedArrangement = [];
        generatedArrangement[0] = initialEntityOne;
        generatedArrangement[1] = initialEntityTwo;

        // Recursive helper to extend the animal arrangement
        const extendArrangement = (positionIndex) => {
            if (positionIndex >= sequenceLength) {
                return;
            }
            const previousPreviousCreature = generatedArrangement[positionIndex - 2];
            const previousCurrentCreature = generatedArrangement[positionIndex - 1];
            const currentPositionIndicator = indicators[positionIndex - 1];

            // Recurrence relation:
            // next_animal = previous_previous_animal XOR (previous_current_animal XOR current_observation)
            // Where XOR is boolean logical XOR
            const nextCreature = previousPreviousCreature ^ (previousCurrentCreature ^ currentPositionIndicator);
            generatedArrangement[positionIndex] = nextCreature;
            extendArrangement(positionIndex + 1);
        };

        extendArrangement(2); // Start building from the third animal (index 2)

        const firstCreature = generatedArrangement[0];
        const secondCreature = generatedArrangement[1];
        const finalCreature = generatedArrangement[sequenceLength - 1];
        const penultimateCreature = generatedArrangement[sequenceLength - 2];

        const firstIndicator = indicators[0];
        const finalIndicator = indicators[sequenceLength - 1];

        // Final verification conditions for circular consistency
        // (Pk=='S') XOR (Sk=='o') XOR (Pk-1==Pk+1) MUST be TRUE
        const validationFront = firstCreature ^ firstIndicator ^ (finalCreature === secondCreature);
        const validationRear = finalCreature ^ finalIndicator ^ (penultimateCreature === firstCreature);

        if (validationFront && validationRear) {
            return generatedArrangement.map(val => val ? 'W' : 'S').join('');
        }
    }

    return -1;
}