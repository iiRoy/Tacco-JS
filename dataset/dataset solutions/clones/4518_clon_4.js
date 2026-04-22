const processEntry = (sourceData) => {
    const lines = sourceData.split("\n");
    const primaryString = lines[0];

    const isUniform = (textSegment) => {
        if (textSegment.length <= 1) {
            return true;
        }
        const initialUnit = textSegment[0];
        return Array.from(textSegment).every(unit => unit === initialUnit);
    };

    if (isUniform(primaryString)) {
        console.log(0);
        return;
    }

    let overallMinimumSteps = Infinity;

    const characterSequence = Array.from({ length: 26 }, (_, charIndex) =>
        String.fromCharCode('a'.charCodeAt(0) + charIndex)
    );

    characterSequence.forEach(targetCharacter => {
        const segments = primaryString.split(targetCharacter);
        const stepsForCurrentCharacter = segments.reduce((maxLen, currentSegment) =>
            Math.max(maxLen, currentSegment.length), 0
        );
        overallMinimumSteps = Math.min(overallMinimumSteps, stepsForCurrentCharacter);
    });

    console.log(overallMinimumSteps);
};

processEntry(require("fs").readFileSync("/dev/stdin", "utf8"));