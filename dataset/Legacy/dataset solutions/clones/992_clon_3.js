function _reducePairForDivisorSearch(val1, val2) {
    let reducedVal1 = val1;
    let reducedVal2 = val2;

    if (reducedVal1 > reducedVal2) {
        reducedVal1 = reducedVal1 % reducedVal2;
    } else if (reducedVal1 < reducedVal2) {
        const temp = reducedVal2;
        reducedVal2 = reducedVal1;
        reducedVal1 = temp % reducedVal1;
    }
    return { reducedA: reducedVal1, reducedB: reducedVal2 };
}

function getCommonDivisors(initialA, initialB) {
    const { reducedA, reducedB } = _reducePairForDivisorSearch(initialA, initialB);

    const divisorList = [];
    for (let divisorCandidate = 1; divisorCandidate <= reducedA; divisorCandidate++) {
        if (reducedA % divisorCandidate === 0 && reducedB % divisorCandidate === 0) {
            divisorList.push(divisorCandidate);
        }
    }
    return divisorList;
}

function findGCD(num1, num2) {
    const allDivisors = getCommonDivisors(num1, num2);
    return Math.max.apply(null, allDivisors);
}

(function(rawDataContent) {
    const inputDelimiter = ' ';
    const numberStrings = rawDataContent.split(inputDelimiter);
    const numericValues = numberStrings.map(Number);

    const [firstNumber, secondNumber] = numericValues;

    console.log(findGCD(firstNumber, secondNumber));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
