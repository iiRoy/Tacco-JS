const processInput = (inputData) => {
    const inputStringRepresentation = String(inputData);
    const finalDigit = Number(inputStringRepresentation[inputStringRepresentation.length - 1]);

    const classificationMap = new Map();
    [2, 4, 5, 7, 9].forEach(digitVal => classificationMap.set(digitVal, 'hon'));
    [0, 1, 6, 8].forEach(digitVal => classificationMap.set(digitVal, 'pon'));
    classificationMap.set(3, 'bon');

    console.log(classificationMap.get(finalDigit));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
