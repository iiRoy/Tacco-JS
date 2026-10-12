function checkPrimality(candidateNumber) {
    const FIRST_PRIME_VAL = 2;
    const SECOND_PRIME_VAL = 3;

    if (candidateNumber === FIRST_PRIME_VAL || candidateNumber === SECOND_PRIME_VAL) {
        return true;
    }

    if (candidateNumber < FIRST_PRIME_VAL) {
        return false;
    }

    if (candidateNumber % FIRST_PRIME_VAL === 0) {
        return false;
    }

    if (candidateNumber % SECOND_PRIME_VAL === 0) {
        return false;
    }

    const sqrtCheckLimit = Math.floor(Math.sqrt(candidateNumber));

    let currentFactor = 1;
    while (true) {
        const potentialDivisorA = currentFactor * 6 - 1;

        if (potentialDivisorA > sqrtCheckLimit) {
            break;
        }

        if (candidateNumber % potentialDivisorA === 0) {
            return false;
        }

        const potentialDivisorB = currentFactor * 6 + 1;
        if (candidateNumber % potentialDivisorB === 0) {
            return false;
        }
        
        currentFactor++;
    }

    return true;
}

const INPUT_STREAM_ENCODING = 'utf8';

function handleIncomingData(inputBuffer) {
    const allReceivedLines = inputBuffer.split('\n');
    const dataLinesToProcess = allReceivedLines.slice(1);

    const primeNumbersCount = dataLinesToProcess.filter(checkPrimality).length;

    console.log(primeNumbersCount);
}

process.stdin.resume();
process.stdin.setEncoding(INPUT_STREAM_ENCODING);
process.stdin.on('data', handleIncomingData);
