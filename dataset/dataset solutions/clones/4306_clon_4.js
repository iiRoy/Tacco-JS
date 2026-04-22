function generateStringFragment(sourceText, currentPosition, accumulator) {
    const cutoffPoint = sourceText.length - 8;

    if (currentPosition >= cutoffPoint || currentPosition < 0) {
        return accumulator;
    }

    return generateStringFragment(sourceText, currentPosition + 1, accumulator + sourceText[currentPosition]);
}

function processIncomingContent(contentString) {
    const desiredLength = contentString.length - 8;

    if (desiredLength <= 0) {
        console.log('');
        return;
    }

    const finalOutput = generateStringFragment(contentString, 0, '');
    console.log('%s', finalOutput);
}