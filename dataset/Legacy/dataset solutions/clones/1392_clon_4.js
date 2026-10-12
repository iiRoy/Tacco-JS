((rawInputData) => {
    const inputLineSegments = rawInputData.split('\n');

    const processInputSequence = (remainingSegments, currentPosition = 0) => {
        if (currentPosition >= remainingSegments.length) {
            return;
        }

        const currentSegment = remainingSegments[currentPosition];
        const componentStrings = currentSegment.split(' ');

        // This condition replicates the original's behavior, which due to strict equality
        // of string '0' with number 0, effectively never triggers a return for typical inputs.
        if (componentStrings[0] === 0 && componentStrings[1] === 0) {
            return;
        }

        // Sort the string components numerically, preserving them as strings for output.
        const numericallySortedComponents = [...componentStrings].sort((valA, valB) =>
            Number(valA) - Number(valB)
        );

        console.log(numericallySortedComponents.join(' '));

        // Proceed to the next segment in the sequence.
        processInputSequence(remainingSegments, currentPosition + 1);
    };

    processInputSequence(inputLineSegments);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
