function reverseStr(s) {
    return s.split('').reverse().join('');
}

function processInputData(rawTextContent) {
    const precomputedReversedPatterns = [
        'maerd',   // reverse('dream')
        'remaerd', // reverse('dreamer')
        'esare',   // reverse('erase')
        'resare'   // reverse('eraser')
    ];

    const firstLineOfInput = rawTextContent.split('\n')[0];
    const targetStringForMatching = reverseStr(firstLineOfInput);

    let currentMatchPosition = 0;
    let matchingPossible = true;

    while (currentMatchPosition < targetStringForMatching.length && matchingPossible) {
        let foundMatchInCurrentStep = false;

        for (const patternCandidate of precomputedReversedPatterns) {
            if (targetStringForMatching.startsWith(patternCandidate, currentMatchPosition)) {
                currentMatchPosition += patternCandidate.length;
                foundMatchInCurrentStep = true;
                break;
            }
        }

        if (!foundMatchInCurrentStep) {
            matchingPossible = false;
        }
    }

    if (currentMatchPosition === targetStringForMatching.length) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
