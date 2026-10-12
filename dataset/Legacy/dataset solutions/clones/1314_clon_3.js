(function(sourceText) {
    const LOWER_A_CHAR_CODE = 'a'.charCodeAt(0);
    const LOWER_Z_CHAR_CODE = 'z'.charCodeAt(0);

    const charFrequencyMap = Array.from({ length: LOWER_Z_CHAR_CODE - LOWER_A_CHAR_CODE + 1 })
        .reduce((accumulator, _, index) => {
            const currentLetter = String.fromCharCode(LOWER_A_CHAR_CODE + index);
            accumulator[currentLetter] = 0;
            return accumulator;
        }, {});

    sourceText.split('').forEach(function(inputChar) {
        const processedChar = inputChar.toLowerCase();
        if (charFrequencyMap.hasOwnProperty(processedChar)) {
            charFrequencyMap[processedChar]++;
        }
    });

    const outputLines = Object.entries(charFrequencyMap).map(function([letterKey, countValue]) {
        return `${letterKey} : ${countValue}`;
    });

    console.log(outputLines.join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
