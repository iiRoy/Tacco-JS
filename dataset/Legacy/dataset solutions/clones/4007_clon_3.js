const getEffectiveSliceResult = (sourceString, sliceArgument) => {
    const numericEquivalent = parseInt(sliceArgument, 10);
    const actualStartIndex = isNaN(numericEquivalent) ? 0 : numericEquivalent;
    return sourceString.slice(actualStartIndex);
};

const determineOutputPhrase = (characterToExamine, searchCriterion) => {
    const isCriterionPresent = characterToExamine.includes(searchCriterion);
    if (isCriterionPresent) {
        return 'Four';
    } else {
        return 'Three';
    }
};

function processInputData(rawInputContent) {
    const NEWLINE_DELIMITER_ARG = '¥n';
    const SPACE_DELIMITER_ARG = ' ';
    const CHARACTER_POSITION_INDEX = 1;
    const TARGET_CHARACTER_VALUE = 'Y';

    // The original slice operation with a non-numeric argument effectively returns the original string.
    // This step explicitly captures that behavior using a helper function.
    let firstProcessedContent = getEffectiveSliceResult(rawInputContent, NEWLINE_DELIMITER_ARG);

    // Access the character at the specified index.
    let characterAtIndex = firstProcessedContent[CHARACTER_POSITION_INDEX];

    // The second slice operation on a single character with a non-numeric argument also effectively returns the character itself.
    let finalCharacterForEvaluation = getEffectiveSliceResult(characterAtIndex, SPACE_DELIMITER_ARG);

    // Determine the appropriate message based on whether the target character is found.
    const outputMessage = determineOutputPhrase(finalCharacterForEvaluation, TARGET_CHARACTER_VALUE);

    console.log(outputMessage);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
