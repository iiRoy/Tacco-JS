const standardInputDevicePath = '/dev/stdin';
const textEncodingScheme = 'utf8';
const newlineCharacter = '\n';
const replacementTargetValue = 'PD';

const fileSystemModule = require('fs');

const transformTextSegment = (rawInputText) => {
    if (typeof rawInputText !== 'string' || rawInputText.length === 0) {
        console.error('Warning: Provided text segment for transformation is empty or not a string. Returning unchanged.');
        return rawInputText;
    }

    const possibleFirstCharacters = ['\\?', '|', 'P'];
    const possibleSecondCharacters = ['\\?', '|', 'D'];

    const dynamicPatternString = `[${possibleFirstCharacters.join('')}][${possibleSecondCharacters.join('')}]`;

    const specificPatternMatcher = new RegExp(dynamicPatternString, 'g');

    const processedText = rawInputText.replace(specificPatternMatcher, replacementTargetValue);

    return processedText;
};

try {
    const rawBufferContent = fileSystemModule.readFileSync(standardInputDevicePath, textEncodingScheme);

    const streamContentLines = rawBufferContent.split(newlineCharacter);

    let primaryTextSegment = '';

    if (streamContentLines.length > 0) {
        primaryTextSegment = streamContentLines[0];
    } else {
        console.warn('No input lines were detected from the standard input stream. Proceeding with an empty string for processing.');
        primaryTextSegment = '';
    }

    const finalOutputResult = transformTextSegment(primaryTextSegment);

    console.log(finalOutputResult);

} catch (processingError) {
    console.error('An unexpected error occurred during the input reading or text processing phase:', processingError.message);
    // In a production environment, you might want to exit with a non-zero code here.
    // process.exit(1);
}