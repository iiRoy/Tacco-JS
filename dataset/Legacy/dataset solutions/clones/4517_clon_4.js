function Main(input) {
    const inputLines = input.split("\n");
    const initialSequence = inputLines[0];

    const checkUniformity = (sequenceString) => new Set(sequenceString).size === 1;

    const calculateTransformationSteps = (currentStringState, targetCharValue, currentStepCount = 0) => {
        if (currentStepCount > 0) {
            console.log(currentStringState);
        }

        if (checkUniformity(currentStringState)) {
            return currentStepCount;
        }

        const nextStringState = Array.from({ length: currentStringState.length - 1 }, (_, charPosition) => {
            const charAtCurrentPosition = currentStringState.charAt(charPosition);
            const charAtNextPosition = currentStringState.charAt(charPosition + 1);

            return (targetCharValue === charAtCurrentPosition || targetCharValue === charAtNextPosition)
                ? targetCharValue
                : charAtCurrentPosition;
        }).join('');

        return calculateTransformationSteps(nextStringState, targetCharValue, currentStepCount + 1);
    };

    if (checkUniformity(initialSequence)) {
        console.log(0);
        return;
    }

    const alphabetRange = Array.from({ length: 26 }, (_, index) =>
        String.fromCharCode('a'.charCodeAt(0) + index)
    );

    const overallMinimumSteps = alphabetRange.reduce((currentMin, selectedTargetChar) => {
        const stepsForCurrentChar = calculateTransformationSteps(initialSequence, selectedTargetChar);
        return Math.min(currentMin, stepsForCurrentChar);
    }, Infinity);

    console.log(overallMinimumSteps);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
