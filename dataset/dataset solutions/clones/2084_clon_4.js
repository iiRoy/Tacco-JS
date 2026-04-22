function determineConformity(inputData) {
    function checkPattern(currentSegment) {
        if (currentSegment.length === 0) {
            return true;
        }
        if (currentSegment.indexOf('hi') === 0) {
            return checkPattern(currentSegment.substring(2));
        }
        return false;
    }

    const initialValue = String(inputData);
    const evaluationResult = checkPattern(initialValue);
    console.log(evaluationResult ? 'Yes' : 'No');
}

determineConformity(require('fs').readFileSync('/dev/stdin', 'UTF-8'));