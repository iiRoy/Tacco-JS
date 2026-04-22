function parseNumericComponents(dataString) {
    let collectedDigits = [];
    let currentSegment = '';
    for (let idx = 0; idx < dataString.length; ++idx) {
        const digitCandidate = dataString[idx];
        const charCode = digitCandidate.charCodeAt(0);
        if (charCode >= 48 && charCode <= 57) { // ASCII '0' to '9'
            currentSegment += digitCandidate;
        } else {
            if (currentSegment !== '') {
                collectedDigits.push(Number(currentSegment));
                currentSegment = '';
            }
        }
    }
    if (currentSegment !== '') {
        collectedDigits.push(Number(currentSegment));
    }
    return collectedDigits;
}

function calculateValue(textSource) {
    const parts = parseNumericComponents(textSource);
    
    const sourceA = parts[0];
    const sourceP = parts[1];

    const termForA = (sourceA << 1) + sourceA; 
    const totalUnits = sourceP + termForA;
    const finalCount = totalUnits >> 1;

    console.log(finalCount);
}

calculateValue(require("fs").readFileSync("/dev/stdin", "utf8"));