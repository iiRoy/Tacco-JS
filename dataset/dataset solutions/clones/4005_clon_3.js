function processInputData(rawInputString) {
    const LINE_SEPARATOR = '\n';
    const ITEM_SEPARATOR = ' ';
    const SEARCH_TERM = 'Y';
    const POSITIVE_OUTCOME_MESSAGE = 'Four';
    const NEGATIVE_OUTCOME_MESSAGE = 'Three';

    const allInputLines = rawInputString.split(LINE_SEPARATOR);
    const targetLineContent = allInputLines[1];
    const colorIndicators = targetLineContent.split(ITEM_SEPARATOR);

    // The original loop iterates over all elements except the very last one.
    // We replicate this by slicing the array before checking.
    const relevantIndicators = colorIndicators.slice(0, colorIndicators.length - 1);

    let yellowFound = false;
    // Use a higher-order function to check for the presence of the target term.
    yellowFound = relevantIndicators.some(indicatorValue => indicatorValue === SEARCH_TERM);

    if (yellowFound) {
        console.log(POSITIVE_OUTCOME_MESSAGE);
    } else {
        console.log(NEGATIVE_OUTCOME_MESSAGE);
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
