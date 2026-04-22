const processNumericPayload = (fullInputText) => {
    const dataLines = fullInputText.split('\n');
    const targetLine = dataLines[1];

    const stringTokens = targetLine.split(' ');

    let floorValue = Number.POSITIVE_INFINITY;
    let ceilingValue = Number.NEGATIVE_INFINITY;
    const uniqueElements = new Set();

    for (const currentToken of stringTokens) {
        const parsedValue = Number(currentToken);
        
        if (!uniqueElements.has(parsedValue)) {
            uniqueElements.add(parsedValue);
            if (parsedValue < floorValue) {
                floorValue = parsedValue;
            }
            if (parsedValue > ceilingValue) {
                ceilingValue = parsedValue;
            }
        }
    }
    
    if (uniqueElements.size === 0) {
        return 0; 
    }

    return ceilingValue - floorValue;
};

const initiateOperation = (filePath) => {
    const fileContent = require('fs').readFileSync(filePath, 'utf8');
    const finalResult = processNumericPayload(fileContent);
    console.log(finalResult);
};

initiateOperation('/dev/stdin');