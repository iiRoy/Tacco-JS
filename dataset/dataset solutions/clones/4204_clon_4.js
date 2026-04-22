process.stdin.setEncoding('utf8');

let collectedData = '';

process.stdin.on('data', fragment => {
    collectedData += fragment;
});

process.stdin.on('end', () => {
    const refinedData = collectedData.replace(/^\s+|\s+$/g, '');

    function examineRoute(incomingText, positionIncoming, positionRoute) {
        const sequenceSegments = [
            { characterValue: 'A', isSkippable: true },
            { characterValue: 'K', isSkippable: false },
            { characterValue: 'I', isSkippable: false },
            { characterValue: 'H', isSkippable: true },
            { characterValue: 'A', isSkippable: true },
            { characterValue: 'B', isSkippable: true },
            { characterValue: 'A', isSkippable: true },
            { characterValue: 'R', isSkippable: true },
            { characterValue: 'A', isSkippable: true }
        ];

        // Scenario 1: All input characters have been processed.
        if (positionIncoming === incomingText.length) {
            // Check if any remaining pattern segments are mandatory.
            // If so, the input string did not fully satisfy the pattern's mandatory parts.
            for (let j = positionRoute; j < sequenceSegments.length; ++j) {
                if (!sequenceSegments[j].isSkippable) {
                    return false; // Found an unfulfilled mandatory segment.
                }
            }
            return true; // All remaining pattern segments are optional, so this path is valid.
        }

        // Scenario 2: All pattern segments have been processed.
        // This means a prefix of the input string successfully matched the entire pattern.
        // The original regex allows for extra characters after the matched pattern.
        if (positionRoute === sequenceSegments.length) {
            return true;
        }

        const actualChar = incomingText[positionIncoming];
        const currentSegment = sequenceSegments[positionRoute];

        // Option A: Attempt to match the current input character with the current pattern segment.
        if (actualChar === currentSegment.characterValue) {
            if (examineRoute(incomingText, positionIncoming + 1, positionRoute + 1)) {
                return true; // Path found by consuming both character and segment.
            }
        }

        // Option B: If the current pattern segment is skippable, attempt to skip it.
        // This is tried if Option A failed or if the segment is optional (even if it matched,
        // we explore skipping it as another valid path).
        if (currentSegment.isSkippable) {
            if (examineRoute(incomingText, positionIncoming, positionRoute + 1)) {
                return true; // Path found by skipping the pattern segment.
            }
        }

        // If neither option A nor option B (if applicable) leads to a successful path,
        // then this branch of the recursion is a failure.
        return false;
    }

    const validationOutcome = examineRoute(refinedData, 0, 0) ? "YES" : "NO";
    process.stdout.write(validationOutcome + '\n');
});