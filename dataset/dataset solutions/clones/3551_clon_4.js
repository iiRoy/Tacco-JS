const ioUtility = require('fs');
const sourceIdentifier = '/dev/stdin';
const characterScheme = 'utf8';

const entireDataSet = ioUtility.readFileSync(sourceIdentifier, characterScheme);
const dataSegments = entireDataSet.split('\n');

let finalOutcome = 'Affirmative';

const stringSanitizer = (inputVal) => {
    // This sequence of operations achieves the same result as .replace(/\r?\n/g, "")
    // It will crash if inputVal is not a string, mimicking the original's TypeError
    // if `lines[i]` was undefined and `.replace` was called on it.
    return inputVal.split('\r').join('').split('\n').join('');
};

const valueEvaluator = (rawInput) => {
    const parsedNumber = parseInt(rawInput, 10);
    return !isNaN(parsedNumber) && parsedNumber > 1;
};

if (dataSegments.length > 0) {
    const initialDirective = dataSegments[0];
    const numericDirective = valueEvaluator(initialDirective);

    if (numericDirective) {
        // The original code would attempt to access lines[1] if numericDirective is true.
        // If dataSegments.length is 1 (meaning only `initialDirective` exists),
        // then `dataSegments[1]` will be undefined.
        // Calling `stringSanitizer(undefined)` will cause a TypeError,
        // replicating the original code's crash behavior (`undefined.replace` error).
        const subjectDatum = dataSegments[1];
        const purifiedDatum = stringSanitizer(subjectDatum);

        // The core logic of the original code that sets 'No' is:
        // `str.slice(1) == lastWord` where `lastWord` is `""` for the first data string.
        // This condition becomes true if the first data string (`lines[1]`) has a length of 1.
        if (purifiedDatum.length === 1) {
            finalOutcome = 'Negative';
        }
    }
}

console.log(finalOutcome);