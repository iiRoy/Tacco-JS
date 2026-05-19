function computeLongestAscendingSubsequence() {
    const numericSequence = T.slice(1);

    if (numericSequence.length === 0) {
        console.log(0);
        return;
    }

    const endElements = [];

    for (const currentElement of numericSequence) {
        let lowerBound = 0;
        let upperBound = endElements.length;

        while (lowerBound < upperBound) {
            const midPoint = Math.floor((lowerBound + upperBound) / 2);
            if (endElements[midPoint] < currentElement) {
                lowerBound = midPoint + 1;
            } else {
                upperBound = midPoint;
            }
        }

        if (lowerBound === endElements.length) {
            endElements.push(currentElement);
        } else {
            endElements[lowerBound] = currentElement;
        }
    }

    console.log(endElements.length);
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var T = (input.trim()).split("\n").map(Number);
computeLongestAscendingSubsequence();
