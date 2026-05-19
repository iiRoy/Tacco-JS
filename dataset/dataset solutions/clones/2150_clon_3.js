function processInput(inputStr) {
    const cleanedInput = inputStr.replace(/\r?\n/g, ' ').trim();
    const inputSegments = cleanedInput.split(' ');

    const countString = inputSegments.shift();
    const totalElementsToEvaluate = Number(countString);
    const numericValues = inputSegments.map(Number);

    let finalApprovalStatus = '';

    const checkNumberEligibility = (value) => {
        if (value % 2 !== 0) {
            return null; // Odd numbers don't trigger approval or denial
        }
        // It's an even number
        if (value % 3 === 0 || value % 5 === 0) {
            return 'APPROVED';
        } else {
            return 'DENIED';
        }
    };

    for (let currentIdx = 0; currentIdx < totalElementsToEvaluate; currentIdx++) {
        const currentNumericValue = numericValues[currentIdx];
        const evaluationOutcome = checkNumberEligibility(currentNumericValue);

        if (evaluationOutcome === 'DENIED') {
            finalApprovalStatus = 'DENIED';
            break;
        } else if (evaluationOutcome === 'APPROVED') {
            finalApprovalStatus = 'APPROVED';
        }
        // If evaluationOutcome is null (for odd numbers), finalApprovalStatus remains unchanged.
    }

    console.log(finalApprovalStatus);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
