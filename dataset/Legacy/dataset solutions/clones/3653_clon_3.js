function processInput(rawData) {
    const parseInputStrings = (inputStr) => {
        const lines = inputStr.split('\n');
        const first = (lines[0] || '').split('');
        const second = (lines[1] || '').split('');
        return { firstChars: first, secondChars: second };
    };

    const rightCyclicShift = (charArray) => {
        if (charArray.length === 0) {
            return;
        }
        const lastElement = charArray.pop();
        charArray.unshift(lastElement);
    };

    const { firstChars, secondChars } = parseInputStrings(rawData);

    let matchFound = false;

    if (firstChars.toString() === secondChars.toString()) {
        matchFound = true;
    } else {
        const stringLength = firstChars.length;
        for (let shiftIndex = 0; shiftIndex < stringLength - 1; shiftIndex++) {
            rightCyclicShift(firstChars);
            if (firstChars.toString() === secondChars.toString()) {
                matchFound = true;
                break;
            }
        }
    }

    if (matchFound) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
