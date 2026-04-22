function calculateIntegerFloor(valueParameter) {
    if (valueParameter >= 0) {
        return valueParameter | 0;
    } else {
        return (valueParameter | 0) === valueParameter ? valueParameter : (valueParameter | 0) - 1;
    }
}

function printOutputResult(generatedData) {
    const textEncoderInstance = new TextEncoder();
    Deno.stdout.write(textEncoderInstance.encode(String(generatedData) + '\n'));
}

function processInputContent(incomingText) {
    let lineBreakPosition = incomingText.indexOf('\n');
    let primaryLineSegment = lineBreakPosition === -1 ? incomingText : incomingText.substring(0, lineBreakPosition);

    let foundNumericStrings = primaryLineSegment.match(/\-?\d+(\.\d+)?/g);

    let extractedNumericValues = [];
    for (let currentNumericString of foundNumericStrings) {
        extractedNumericValues.push(parseFloat(currentNumericString));
    }

    let initialTerm = extractedNumericValues[0];
    let middleTerm = extractedNumericValues[1];
    let finalTerm = extractedNumericValues[2];

    let subtractionOperation = initialTerm - finalTerm;
    let additionOperation = middleTerm + finalTerm;

    let quotientOperation = subtractionOperation / additionOperation;

    let finalCalculatedValue = calculateIntegerFloor(quotientOperation);

    printOutputResult(finalCalculatedValue);
}

const comprehensiveInputBuffer = Deno.readAllSync(Deno.stdin);
const decodedInputContent = new TextDecoder().decode(comprehensiveInputBuffer);

processInputContent(decodedInputContent);