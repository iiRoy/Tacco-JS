const dataIOUtility = require("node:fs");

const primaryInputPath = "/dev/stdin";
const textEncodingStandard = "utf8";
const sectionBreakDelimiter = '\n\n';
const whitespaceRemovalRegex = /\s/g;

const patternToCategoryMap = new Map([
    ["1111", "C"],
    ["111", "F"],
    ["1101", "D"],
    ["101", "B"],
    ["1000001", "G"],
    ["10000001", "A"]
]);

const fallbackCategoryIdentifier = "E";

function assignCategorization(inputSequence) {
    if (!inputSequence || typeof inputSequence !== 'string' || inputSequence.length === 0) {
        return fallbackCategoryIdentifier;
    }

    for (let [currentPattern, associatedCategory] of patternToCategoryMap.entries()) {
        if (inputSequence.includes(currentPattern)) {
            return associatedCategory;
        }
    }

    return fallbackCategoryIdentifier;
}

const rawContentBuffer = dataIOUtility.readFileSync(primaryInputPath, textEncodingStandard);

const cleanedGlobalContent = rawContentBuffer.trim();

const distinctProcessingUnits = cleanedGlobalContent.split(sectionBreakDelimiter);

distinctProcessingUnits.map(function(singleRawUnit) {
    const normalizedSequence = singleRawUnit.replace(whitespaceRemovalRegex, '');

    const determinedCategory = assignCategorization(normalizedSequence);

    console.log(determinedCategory);
});