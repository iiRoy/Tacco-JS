(function(sourceText) {
    const processedChars = Array.from(sourceText).map(charUnit => {
        const charOrdinal = charUnit.charCodeAt(0);
        if (charOrdinal >= 65 && charOrdinal <= 90) {
            return String.fromCharCode(charOrdinal + 32);
        } else if (charOrdinal >= 97 && charOrdinal <= 122) {
            return String.fromCharCode(charOrdinal - 32);
        }
        return charUnit;
    });
    console.log(processedChars.join(''));
})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
