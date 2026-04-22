const assessEquivalence = (subjectText) => {
    if (subjectText.length <= 1) {
        return true;
    }
    if (subjectText.charAt(0) !== subjectText.charAt(subjectText.length - 1)) {
        return false;
    }
    return assessEquivalence(subjectText.substring(1, subjectText.length - 1));
};

const initiateAnalysis = (sourceContent) => {
    const refinedSequence = sourceContent.trim();
    const midpointIndex = Math.trunc(refinedSequence.length / 2);
    const initialSegment = refinedSequence.substring(0, midpointIndex);

    const fullSequenceIsSymmetric = assessEquivalence(refinedSequence);
    const segmentIsSymmetric = assessEquivalence(initialSegment);

    console.log(fullSequenceIsSymmetric && segmentIsSymmetric ? "Yes" : "No");
};

initiateAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));