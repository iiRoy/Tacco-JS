function processInputAndPluralize(rawTextContent) {
    const firstLine = rawTextContent.split('\n')[0];
    const cleanedWord = firstLine.trim();

    const lastCharacter = cleanedWord.slice(-1);
    
    const suffixToAppend = (lastCharacter === 's') ? 'es' : 's';

    return cleanedWord + suffixToAppend;
}

function executePluralization(dataSource) {
    console.log(processInputAndPluralize(dataSource));
}

executePluralization(require('fs').readFileSync('/dev/stdin', 'utf8'));
