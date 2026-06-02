const processInput = inputVal => {
    const inputString = String(inputVal);
    const lastCharIndex = inputString.length - 1;
    const lastDigitChar = inputString[lastCharIndex];
    const lastDigit = Number(lastDigitChar);

    const getOutputString = (digitValue) => {
        switch (digitValue) {
            case 2:
            case 4:
            case 5:
            case 7:
            case 9:
                return 'hon';
            case 0:
            case 1:
            case 6:
            case 8:
                return 'pon';
            case 3:
                return 'bon';
            default:
                return null;
        }
    };

    const finalOutput = getOutputString(lastDigit);
    if (finalOutput !== null) {
        console.log(finalOutput);
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
