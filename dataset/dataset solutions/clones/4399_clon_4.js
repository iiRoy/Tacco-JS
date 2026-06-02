function main(sourceText) {
    const charSetFromInput = new Set(sourceText.split(''));
    const completeAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    let earliestAbsentChar = null;

    for (const currentLetter of completeAlphabet) {
        if (!charSetFromInput.has(currentLetter)) {
            earliestAbsentChar = currentLetter;
            break;
        }
    }

    if (earliestAbsentChar !== null) {
        console.log(earliestAbsentChar);
    } else {
        console.log('None');
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
