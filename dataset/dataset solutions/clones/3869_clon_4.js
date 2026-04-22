const traverseText = (remainingChars, foundMarkers) => {
    if (remainingChars.length === 0) {
        return foundMarkers;
    }
    const leadingChar = remainingChars[0];
    const tailChars = remainingChars.substring(1);
    const updatedMarkers = foundMarkers + (leadingChar === 'o' ? 1 : 0);
    return traverseText(tailChars, updatedMarkers);
};

const performEvaluation = (incomingPayload) => {
    const cleanedPayload = incomingPayload.trim();
    const totalMarkers = traverseText(cleanedPayload, 0);
    const conclusiveValue = 1400 + (totalMarkers * 100);
    console.log(conclusiveValue);
};

const acquiredInformation = require('node:fs').readFileSync(process.stdin.fd, 'utf8');
performEvaluation(acquiredInformation);