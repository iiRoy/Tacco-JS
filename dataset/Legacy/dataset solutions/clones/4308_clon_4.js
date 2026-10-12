'use strict';

const processSourceData = rawContent => {
    const terminalPattern = 'FESTIVAL';
    const patternLength = terminalPattern.length;

    // Original: input.split('\n').map(arg => arg.split(' '))
    //           const S = args[0][0]
    // New: Directly extract the first word of the first line using chained string methods.
    const primarySegment = rawContent.split('\n')[0].split(' ')[0];

    // Original: const md = S.match(/^(.+)FESTIVAL$/)
    //           console.log(md[1])
    // New: Use string methods (lastIndexOf, slice) and explicit conditional logic
    //      to achieve equivalent functionality and error behavior.
    const endingPosition = primarySegment.lastIndexOf(terminalPattern);

    // If 'FESTIVAL' is not found or not at the very end of the string,
    // the original code's regex match would return null, leading to a TypeError
    // when attempting to access md[1]. We explicitly replicate this error.
    if (endingPosition === -1 || endingPosition !== primarySegment.length - patternLength) {
        // Mimic the exact TypeError: Cannot read properties of null (reading '1')
        // by attempting to access property '1' of a null value.
        const nonExistentMatch = null;
        console.log(nonExistentMatch[1]);
    } else {
        // If 'FESTIVAL' is correctly found at the end, extract the preceding part.
        const resultPrefix = primarySegment.slice(0, endingPosition);
        console.log(resultPrefix);
    }
};

processSourceData(require('fs').readFileSync('/dev/stdin', 'utf8'));
