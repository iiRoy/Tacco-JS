const printToConsole = console.log;

const HASH_CHARACTER = '#';
const BORDER_PADDING_OFFSET = 2;
const STANDARD_INPUT_FILE_DESCRIPTOR = 0;
const TEXT_ENCODING_UTF8 = 'utf8';
const LINE_BREAK_DELIMITER = '\n';
const FIELD_SEPARATOR_SPACE = ' ';

function createRepeatedString(count, character) {
    return character.repeat(count);
}

const fileSystemUtility = require('fs');
const rawInputContent = fileSystemUtility.readFileSync(STANDARD_INPUT_FILE_DESCRIPTOR, TEXT_ENCODING_UTF8);
const allInputLines = rawInputContent.split(LINE_BREAK_DELIMITER);

const firstInputLine = allInputLines[0];
const parsedNumericDimensions = firstInputLine.split(FIELD_SEPARATOR_SPACE).map(Number);

const [gridHeight, gridWidth] = parsedNumericDimensions;

const totalBorderLength = gridWidth + BORDER_PADDING_OFFSET;
const borderString = createRepeatedString(totalBorderLength, HASH_CHARACTER);

printToConsole(borderString);

function wrapAndPrintLine(content, wrapperChar) {
    printToConsole(`${wrapperChar}${content}${wrapperChar}`);
}

for (let currentLineIndex = 0; currentLineIndex < gridHeight; currentLineIndex++) {
    const contentLine = allInputLines[currentLineIndex + 1];
    wrapAndPrintLine(contentLine, HASH_CHARACTER);
}

printToConsole(borderString);
