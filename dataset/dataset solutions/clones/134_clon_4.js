const obtainInputContent = (args) => args.length > 2 ? args[2] : "";

const prepareLines = (fullText) => {
    const segments = fullText.split(/\r?\n/);
    return segments.map(seg => seg.replace(/^\s+|\s+$/g, '')).filter(Boolean);
};

const relayMessage = (content) => {
    globalThis.process.stdout.write(content + '\n');
};

const processLineSegment = (allSegments, segmentIndex) => {
    if (segmentIndex >= allSegments.length) {
        return;
    }

    const currentSegment = allSegments[segmentIndex];
    const individualNumbers = currentSegment.split(/\s+/).filter(Boolean);

    let trackDesignations = { alpha: 0, beta: 0 };
    let outcomeDecided = false;

    const examineNumbersInSequence = (remainingItems, currentTrackStates, currentItemIndex) => {
        if (remainingItems.length === 0 || outcomeDecided) {
            return currentTrackStates;
        }

        const firstItem = remainingItems[0];
        const restItems = remainingItems.slice(1);

        const parsedValue = Number(firstItem);

        const diffAlpha = parsedValue - currentTrackStates.alpha;
        const diffBeta = parsedValue - currentTrackStates.beta;

        if (diffAlpha < 0 && diffBeta < 0) {
            relayMessage("NO");
            outcomeDecided = true;
            return currentTrackStates;
        }

        let nextTrackStates = { ...currentTrackStates };

        if (diffAlpha >= 0 && diffBeta >= 0) {
            if (currentTrackStates.alpha >= currentTrackStates.beta) {
                nextTrackStates.alpha = parsedValue;
            } else {
                nextTrackStates.beta = parsedValue;
            }
        } else if (diffAlpha >= 0) {
            nextTrackStates.alpha = parsedValue;
        } else {
            nextTrackStates.beta = parsedValue;
        }

        if (currentItemIndex === 9 && !outcomeDecided) {
            relayMessage("YES");
        }

        return examineNumbersInSequence(restItems, nextTrackStates, currentItemIndex + 1);
    };

    examineNumbersInSequence(individualNumbers, trackDesignations, 0);

    processLineSegment(allSegments, segmentIndex + 1);
};

const rawInputData = obtainInputContent(globalThis.process.argv);
const processedLines = prepareLines(rawInputData);

processLineSegment(processedLines, 1);