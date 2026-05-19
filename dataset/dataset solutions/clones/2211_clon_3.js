function processInput(rawInput) {
    let trimmedContent = rawInput.trim();
    let partsArray = trimmedContent.split(' ');

    let firstElement = partsArray[0];
    let secondElement = partsArray[1];

    const areElementsIdentical = (valA, valB) => {
        return valA === valB;
    };

    if (areElementsIdentical(firstElement, secondElement)) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
