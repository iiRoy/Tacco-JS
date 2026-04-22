function findSmallestDivisor(inputNum) {
    if (inputNum % 2 === 0) {
        return 2;
    }
    for (let divisorCandidate = 3; divisorCandidate * divisorCandidate <= inputNum; divisorCandidate += 2) {
        if (inputNum % divisorCandidate === 0) {
            return divisorCandidate;
        }
    }
    return inputNum;
}

const numberSequence = [2, 3];

for (let loopIndex = 1, primeGenLimit = 50024; loopIndex * 6 + 1 < primeGenLimit; loopIndex++) {
    const firstCandidate = loopIndex * 6 - 1;
    const secondCandidate = loopIndex * 6 + 1;

    (findSmallestDivisor(firstCandidate) === firstCandidate) && numberSequence.push(firstCandidate);
    (findSmallestDivisor(secondCandidate) === secondCandidate) && numberSequence.push(secondCandidate);
}

const sequenceLength = numberSequence.length;

process.stdin.on("data", function(inputChunk) {
    (inputChunk + "")
        .trim()
        .split("\n")
        .some(function(targetNumberString) {
            let targetNumber = +targetNumberString;

            for (let sequenceIterator = 0; sequenceIterator < sequenceLength; ++sequenceIterator) {
                if (targetNumber < numberSequence[sequenceIterator]) {
                    console.log(
                        (numberSequence[sequenceIterator - 1] === targetNumber ?
                            numberSequence[sequenceIterator - 2] :
                            numberSequence[sequenceIterator - 1]),
                        numberSequence[sequenceIterator]
                    );
                    break;
                }
            }
        });
}).resume();