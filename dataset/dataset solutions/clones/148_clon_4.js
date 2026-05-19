function locatePatternInfo(sourceContent) {
    let initialMarkerPosition = -1;

    for (let currentCharacterIndex = 0; currentCharacterIndex < sourceContent.length; currentCharacterIndex++) {
        const characterAtCurrentIndex = sourceContent[currentCharacterIndex];

        if (characterAtCurrentIndex === '1') {
            if (initialMarkerPosition === -1) {
                initialMarkerPosition = currentCharacterIndex;
            } else {
                let segmentIsComposedOfValidChars = true;
                for (let segmentScanIndex = initialMarkerPosition + 1; segmentScanIndex < currentCharacterIndex; segmentScanIndex++) {
                    const segmentChar = sourceContent[segmentScanIndex];
                    if (!('0' <= segmentChar && segmentChar <= '9') && segmentChar !== '\n') {
                        segmentIsComposedOfValidChars = false;
                        break;
                    }
                }

                if (segmentIsComposedOfValidChars) {
                    const matchedSequenceLength = currentCharacterIndex - initialMarkerPosition + 1;
                    return [{ length: matchedSequenceLength }];
                } else {
                    initialMarkerPosition = currentCharacterIndex;
                }
            }
        } else if (initialMarkerPosition !== -1) {
            if (!('0' <= characterAtCurrentIndex && characterAtCurrentIndex <= '9') && characterAtCurrentIndex !== '\n') {
                initialMarkerPosition = -1;
            }
        }
    }

    return null;
}

require("fs").readFileSync("/dev/stdin", "utf8").split('\n\n').map(function(textBlock) {
    const patternMatchResult = locatePatternInfo(textBlock);
    const characterLookupIndex = patternMatchResult[0].length % 11;
    console.log('AE..C.BD.FG'[characterLookupIndex]);
});
