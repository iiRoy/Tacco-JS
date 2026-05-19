const fileSystemModule = require('fs');

const STANDARD_INPUT_PATH = '/dev/stdin';
const LINE_BREAK_DELIMITER = '\n';
const REPLACEMENT_TARGET_VALUE = 'PD';

function retrieveFileContent(filePath, encoding = 'utf8') {
    return fileSystemModule.readFileSync(filePath, encoding);
}

function performPatternReplacement(sourceText, searchPattern, replaceWith) {
    const effectivePattern = new RegExp(searchPattern.source, searchPattern.flags.includes('g') ? searchPattern.flags : searchPattern.flags + 'g');
    return sourceText.replace(effectivePattern, replaceWith);
}

const fullInputBuffer = retrieveFileContent(STANDARD_INPUT_PATH);

const rawInputLines = fullInputBuffer.split(LINE_BREAK_DELIMITER);

const mainProcessingString = rawInputLines[0];

const searchRegexPattern = new RegExp('[\\?|P][\\?|D]', 'g');

const finalProcessedString = performPatternReplacement(mainProcessingString, searchRegexPattern, REPLACEMENT_TARGET_VALUE);

console.log(finalProcessedString);
