const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

(function(rawData) {
    const firstCharCode = 'a'.charCodeAt(0);
    const lastCharCode = 'z'.charCodeAt(0);

    const alphabetCharacters = Array.from({ length: lastCharCode - firstCharCode + 1 }, (_, idx) =>
        String.fromCharCode(firstCharCode + idx)
    );

    const charCounts = alphabetCharacters.reduce((accumulator, charKey) => {
        accumulator[charKey] = 0;
        return accumulator;
    }, {});

    for (const inputChar of rawData.split('')) {
        const lowerCaseChar = inputChar.toLowerCase();
        if (charCounts.hasOwnProperty(lowerCaseChar)) {
            charCounts[lowerCaseChar]++;
        }
    }

    const resultLines = [];
    for (const charKey in charCounts) {
        if (Object.prototype.hasOwnProperty.call(charCounts, charKey)) {
            resultLines.push(`${charKey}: ${charCounts[charKey]}`);
        }
    }
    console.log(resultLines.join('\n'));

})(fileContent);
