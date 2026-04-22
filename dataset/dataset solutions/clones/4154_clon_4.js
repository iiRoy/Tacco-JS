function ProcessInputData(sourceData) {
    let lineSegments = sourceData.match(/[^\n]+/g);
    let primaryText = lineSegments[0];
    let secondaryText = lineSegments[1];

    let charFrequenciesPrimary = new Uint16Array(65536); // Covers full Unicode BMP for char code counts
    for (let idx = 0; idx < primaryText.length; ++idx) {
        charFrequenciesPrimary[primaryText.charCodeAt(idx)]++;
    }

    let arrangedPrimaryChars = [];
    for (let codeVal = 0; codeVal < charFrequenciesPrimary.length; ++codeVal) {
        for (let k = 0; k < charFrequenciesPrimary[codeVal]; ++k) {
            arrangedPrimaryChars.push(String.fromCharCode(codeVal));
        }
    }
    let primarySequenceRepresentation = arrangedPrimaryChars.join(',');

    let charFrequenciesSecondary = new Uint16Array(65536);
    for (let idx = 0; idx < secondaryText.length; ++idx) {
        charFrequenciesSecondary[secondaryText.charCodeAt(idx)]++;
    }

    let arrangedSecondaryChars = [];
    for (let codeVal = charFrequenciesSecondary.length - 1; codeVal >= 0; --codeVal) { // Iterate character codes in reverse
        for (let k = 0; k < charFrequenciesSecondary[codeVal]; ++k) {
            arrangedSecondaryChars.push(String.fromCharCode(codeVal));
        }
    }
    let secondarySequenceRepresentation = arrangedSecondaryChars.join(',');

    if (primarySequenceRepresentation <= secondarySequenceRepresentation) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));