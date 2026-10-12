const extractFirstMeaningfulLine = (fullInputContent) => {
    const lineSeparator = "\n";
    const contentLines = fullInputContent.split(lineSeparator);
    // The original code takes the first element of the split array,
    // even if it's an empty string (e.g., if input is just "\n" or empty).
    // This behavior is preserved.
    return contentLines[0];
};

const resolvePluralSuffix = (characterToCheck) => {
    const S_CHARACTER_LOWERCASE = "s";
    const SUFFIX_FOR_S_ENDINGS = "es";
    const DEFAULT_PLURAL_SUFFIX = "s";

    if (characterToCheck === S_CHARACTER_LOWERCASE) {
        return SUFFIX_FOR_S_ENDINGS;
    } else {
        return DEFAULT_PLURAL_SUFFIX;
    }
};

function processInput(rawInputData) {
    const targetString = extractFirstMeaningfulLine(rawInputData);

    let finalCharacter = "";
    const currentStringLength = targetString.length;

    // Determine the last character, handling potential empty strings
    if (currentStringLength > 0) {
        finalCharacter = targetString[currentStringLength - 1];
    }
    // If targetString is empty, finalCharacter remains "", which correctly
    // leads to the "s" suffix by resolvePluralSuffix.

    const determinedSuffix = resolvePluralSuffix(finalCharacter);

    console.log(`${targetString}${determinedSuffix}`);
}

const fileSystemUtility = require("fs");
const standardInputFilePath = "/dev/stdin";
const textEncodingFormat = "utf8";

const inputContentFromStdin = fileSystemUtility.readFileSync(standardInputFilePath, textEncodingFormat);
processInput(inputContentFromStdin);
