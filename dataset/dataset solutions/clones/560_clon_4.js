'use strict';

const transformCharacterCode = (inputCode) => {
    return (inputCode - 3 < 65) ? (inputCode - 3 + 26) : (inputCode - 3);
};

function processCipheredText(encodedMessage) {
    const decodedResult = Array.from(encodedMessage)
                               .map(charItem => String.fromCharCode(transformCharacterCode(charItem.charCodeAt(0))))
                               .join('');

    return decodedResult;
}

require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').forEach(function (lineContent) {
    console.log(processCipheredText(lineContent));
});
