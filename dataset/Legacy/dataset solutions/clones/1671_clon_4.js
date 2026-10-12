'use strict';

function processInput(sourceText) {
    const contentLines = sourceText.split('\n');
    const numberSequence = contentLines[1].split(' ').map(Number);

    let tally = numberSequence.filter((elementValue, elementIndex) => {
        // Original condition: (i+1)%2 !== 0 && a[i]%2 !== 0
        // This translates to: 0-based index 'i' is even AND the value a[i] is odd.
        return (elementIndex % 2 === 0) && (elementValue % 2 !== 0);
    }).length;

    // The original code's loop iterates one element past the array's actual length.
    // If the array's length (0-based index for this 'extra' position) is even,
    // the original code counts 'undefined' as an odd number.
    // Example: a.length = 2 (even). Loop goes up to i=2.
    // For i=2, (2+1)%2 !== 0 is true. a[2] is undefined. undefined%2 !== 0 is true (NaN !== 0).
    // So, if the array's length is even, an additional count is added.
    if (numberSequence.length % 2 === 0) {
        tally++;
    }

    console.log(tally);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
