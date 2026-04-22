const extractInteger = (textFragment) => {
    let positionIndex = 0;
    // Advance past any initial whitespace characters
    while (positionIndex < textFragment.length && /\s/.test(textFragment[positionIndex])) {
        positionIndex++;
    }

    let numericalPart = '';
    // Collect all consecutive digit characters
    while (positionIndex < textFragment.length && /\d/.test(textFragment[positionIndex])) {
        numericalPart += textFragment[positionIndex];
        positionIndex++;
    }

    // If no digits were found at all, return Not-a-Number
    if (numericalPart.length === 0) {
        return NaN;
    }

    // Convert the collected digit string into a number
    return Number(numericalPart);
};

const ProcessInputValues = (sourceContent) => {
    const cleansedContent = sourceContent.trim();
    const componentStrings = cleansedContent.split(' ');

    // Use the custom integer extraction for the first two components
    const firstNumericalValue = extractInteger(componentStrings[0]);
    const secondNumericalValue = extractInteger(componentStrings[1]);

    const combinedTotal = firstNumericalValue + secondNumericalValue;

    // Determine the result based on divisibility by three,
    // handling cases where the sum is not a number.
    const finalDecision = (isNaN(combinedTotal) || combinedTotal % 3 !== 0) ? 'Impossible' : 'Possible';

    console.log(finalDecision);
};

ProcessInputValues(require('fs').readFileSync('/dev/stdin','utf8'));