const transformInput = (textChunk) => {
    const headSymbol = textChunk.length > 0 ? textChunk.charAt(0) : undefined;
    const tailSymbol = textChunk.length > 0 ? textChunk.slice(-1) : undefined;

    const charEnumerator = (currentStr, currentIdx) => {
        if (currentIdx >= currentStr.length) return 0;
        return 1 + charEnumerator(currentStr, currentIdx + 1);
    };
    const totalRepresentedChars = charEnumerator(textChunk, 0);

    const numericMiddleValue = totalRepresentedChars - 2;

    return headSymbol + numericMiddleValue + tailSymbol;
};

const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(transformInput(acquiredData));