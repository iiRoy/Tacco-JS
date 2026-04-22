const processInputData = (incomingText) => {
    const parsedNumber = parseInt(incomingText.split('\n')[0], 10);
    console.log(parsedNumber);

    const lastDigitOfNumber = parsedNumber % 10;

    switch (lastDigitOfNumber) {
        case 0:
        case 2:
        case 4:
        case 5:
        case 6:
        case 8:
            console.log('-1');
            return;
        case 1:
        case 3:
        case 7:
        case 9:
            return;
        default:
            return;
    }
};

const executeProgram = () => {
    const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(rawData);
};

executeProgram();