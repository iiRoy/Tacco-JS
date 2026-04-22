function processInput(dataStream) {
    const contentLines = dataStream.split('\n');
    const primarySequence = contentLines[0];
    const secondarySequence = contentLines[1];

    if (primarySequence.length !== secondarySequence.length) {
        console.log('No');
        return;
    }

    if (primarySequence === secondarySequence) {
        console.log('Yes');
        return;
    }

    const duplicatedPrimary = primarySequence + primarySequence;

    if (duplicatedPrimary.includes(secondarySequence)) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));