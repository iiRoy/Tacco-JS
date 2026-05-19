function main(inputPayload) {
    const characterSequence = inputPayload.split('');

    const accumulatedState = characterSequence.reduce((currentStatus, currentSymbol) => {
        if (currentSymbol === 'S') {
            currentStatus.sCounter++;
        } else if (currentSymbol === 'T') {
            if (currentStatus.sCounter > 0) {
                currentStatus.sCounter--;
            } else {
                currentStatus.tCounter++;
            }
        }
        return currentStatus;
    }, { sCounter: 0, tCounter: 0 });

    console.log(accumulatedState.sCounter + accumulatedState.tCounter);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
