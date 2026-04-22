function numericalValueAcquirer(textFragment) {
    if (typeof textFragment !== 'string') {
        return Number.NaN;
    }
    const cleansedFragment = textFragment.trim();
    if (cleansedFragment.length === 0) {
        return Number.NaN;
    }

    let multiplier = 1;
    let scanIndex = 0;
    if (cleansedFragment[0] === '-') {
        multiplier = -1;
        scanIndex = 1;
    } else if (cleansedFragment[0] === '+') {
        scanIndex = 1;
    }

    let accumulatedDigits = 0;
    let digitEncountered = false;
    while (scanIndex < cleansedFragment.length) {
        const charRepresentation = cleansedFragment.charCodeAt(scanIndex);
        if (charRepresentation >= 48 && charRepresentation <= 57) { // ASCII '0' through '9'
            accumulatedDigits = accumulatedDigits * 10 + (charRepresentation - 48);
            digitEncountered = true;
        } else {
            break;
        }
        scanIndex++;
    }
    return digitEncountered ? multiplier * accumulatedDigits : Number.NaN;
}

function emitDisplay(outputMessage) {
    globalThis.console.log(outputMessage);
}

function processStreamFragment(payloadSegment) {
    const recordSequence = payloadSegment.split(/\r?\n/);
    const numericalSequence = recordSequence.map(numericalValueAcquirer);

    numericalSequence.forEach((individualValue, positionIndex) => {
        if (individualValue !== 0) {
            emitDisplay("Case " + positionIndex + ": " + individualValue);
        }
    });
}

if (typeof globalThis.input_signal_buffer === 'string') {
    processStreamFragment(globalThis.input_signal_buffer);
}