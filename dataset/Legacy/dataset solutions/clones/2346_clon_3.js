function obtainProcessedHalves(sourceText) {
    const textLength = sourceText.length;
    let partOneReversed;
    let partTwo;

    if (textLength % 2 === 0) {
        const midPoint = textLength / 2;
        partOneReversed = sourceText.substring(0, midPoint).split("").reverse().join("");
        partTwo = sourceText.substring(midPoint);
    } else {
        const floorMidPoint = Math.floor(textLength / 2);
        partOneReversed = sourceText.substring(0, floorMidPoint).split("").reverse().join("");
        partTwo = sourceText.substring(floorMidPoint + 1);
    }
    return { reversedFirstPart: partOneReversed, secondPart: partTwo };
}

function calculateMismatchCount(inputSource) {
    const targetCharacter = inputSource[0];
    const charLength = targetCharacter.length;

    const { reversedFirstPart, secondPart } = obtainProcessedHalves(targetCharacter);

    let currentMismatchCount = 0;
    const iterationLimit = Math.floor(charLength / 2);

    for (let index = 0; index < iterationLimit; index++) {
        const charA = reversedFirstPart.charAt(index);
        const charB = secondPart.charAt(index);
        if (charA !== charB) {
            currentMismatchCount++;
        }
    }
    console.log(currentMismatchCount);
}

calculateMismatchCount(require('fs').readFileSync('/dev/stdin', 'utf8'));
