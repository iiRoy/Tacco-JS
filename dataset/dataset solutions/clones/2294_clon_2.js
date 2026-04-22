// This function takes the entire input data as a single string.
const ProcessChallenge = (incomingPayload) => {
    // The input data is split by newlines, with the first line containing key values.
    incomingPayload = incomingPayload.split('\n');
    const firstLineElements = incomingPayload[0].split(' ');

    let alphaPlayerScore = Number.parseInt(firstLineElements[0], 10);
    let betaPlayerScore = Number.parseInt(firstLineElements[1], 10);
    let reductionQuantity = Number.parseInt(firstLineElements[2], 10);

    if (reductionQuantity > alphaPlayerScore) {
        reductionQuantity -= alphaPlayerScore;
        return console.log(0, betaPlayerScore - reductionQuantity);
    } else {
        while (reductionQuantity !== 0) {
            if (alphaPlayerScore > 0) {
                alphaPlayerScore--;
            }
            reductionQuantity--;
        }
        return console.log(alphaPlayerScore, betaPlayerScore);
    }
};

// The following line should not be modified; it handles reading from standard input and invoking the primary function.
ProcessChallenge(require('fs').readFileSync('/dev/stdin', 'utf8'));