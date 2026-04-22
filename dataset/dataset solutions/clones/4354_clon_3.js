function processStreamContent(incomingRawData) {
    const predefinedPrefixValue = "STATIC_PREFIX_VALUE_";
    const sanitizedInputText = String(incomingRawData).trim();

    if (sanitizedInputText.length === 0) {
        console.warn("Input stream contained no usable data. Displaying prefix only.");
        console.log(predefinedPrefixValue);
        return;
    }

    const finalRenderedOutput = `${predefinedPrefixValue}${sanitizedInputText}`;
    console.log(finalRenderedOutput);
}

const fileSystemUtility = require('fs');
const standardInputDevicePath = '/dev/stdin';
const textContentEncoding = 'utf8';

let rawInputBuffer;
try {
    rawInputBuffer = fileSystemUtility.readFileSync(standardInputDevicePath, textContentEncoding);
} catch (readingError) {
    console.error(`Failed to read from ${standardInputDevicePath}. Error: ${readingError.message}`);
    rawInputBuffer = '';
}

processStreamContent(rawInputBuffer);