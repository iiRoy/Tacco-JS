"use strict";
((rawInputContent) => {
    const numericStringSequence = rawInputContent.match(/-?\d+/g);
    
    const numericValuesCollection = [];
    for (let currentStrVal of numericStringSequence) {
        numericValuesCollection.push(+currentStrVal);
    }

    const [val1, val2, val3, val4] = numericValuesCollection;

    const finalOutcome = Math.max(
        val1 * val3,
        val1 * val4,
        val2 * val3,
        val2 * val4
    );

    process.stdout.write(finalOutcome + '\n');
})(
    (function () {
        var libraryLoader = require;
        var fileAccessModule = libraryLoader('fs');
        return fileAccessModule.readFileSync('/dev/stdin', 'utf8');
    })()
);