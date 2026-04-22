const fileSystemHandler = require("fs");

const obtainInputData = () => fileSystemHandler.readFileSync("/dev/stdin", "UTF-8");

const segmentConformityCheck = (targetSegment, comparisonPattern) => {
    if (targetSegment.length !== comparisonPattern.length) {
        return false;
    }
    let charIndex = 0;
    while (charIndex < comparisonPattern.length) {
        if (targetSegment[charIndex] !== '?' && targetSegment[charIndex] !== comparisonPattern[charIndex]) {
            return false;
        }
        charIndex++;
    }
    return true;
};

const executeTextTransformation = () => {
    const fullInputContent = obtainInputData();
    const inputLines = fullInputContent.split('\n');

    const primaryString = inputLines[0];
    const secondaryKeyString = inputLines[1];

    const primaryLength = primaryString.length;
    const secondaryLength = secondaryKeyString.length;

    if (secondaryLength > primaryLength) {
        console.log("UNRESTORABLE");
        return;
    }

    const candidatePositions = Array.from({ length: primaryLength - secondaryLength + 1 }, (_, index) => index)
                                    .reverse();

    const detectedStartingPosition = candidatePositions.find(currentPos => {
        const currentSubsegment = primaryString.substring(currentPos, currentPos + secondaryLength);
        return segmentConformityCheck(currentSubsegment, secondaryKeyString);
    });

    if (detectedStartingPosition === undefined) {
        console.log("UNRESTORABLE");
    } else {
        const initialPortion = primaryString.substring(0, detectedStartingPosition);
        const finalPortion = primaryString.substring(detectedStartingPosition + secondaryLength);
        
        let intermediateResultString = initialPortion + secondaryKeyString + finalPortion;
        
        const finalOutputString = Array.from(intermediateResultString)
                                        .map(symbolChar => (symbolChar === '?' ? 'a' : symbolChar))
                                        .join('');
        
        console.log(finalOutputString);
    }
};

executeTextTransformation();