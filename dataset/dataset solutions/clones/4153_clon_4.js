const separateLines = (fullContent) => {
    let charStorage = Array.from(fullContent);
    
    let startPoint = 0;
    while (startPoint < charStorage.length && /\s/.test(charStorage[startPoint])) {
        startPoint++;
    }
    let endPoint = charStorage.length - 1;
    while (endPoint >= startPoint && /\s/.test(charStorage[endPoint])) {
        endPoint--;
    }
    
    if (startPoint > endPoint) return ['', ''];

    let processedContentChars = charStorage.slice(startPoint, endPoint + 1);
    
    let firstPart = '';
    let secondPart = '';
    let separatorEncountered = false;

    for (let charIdx = 0; charIdx < processedContentChars.length; charIdx++) {
        let currentSymbol = processedContentChars[charIdx];
        if (currentSymbol === '\n' && !separatorEncountered) {
            separatorEncountered = true;
            continue;
        }
        if (separatorEncountered) {
            secondPart += currentSymbol;
        } else {
            firstPart += currentSymbol;
        }
    }
    
    return [firstPart, secondPart];
};

const arrangeAscending = (sourceString) => {
    let numericValues = Array.from(sourceString).map(symbol => symbol.charCodeAt(0));
    let currentLength = numericValues.length;

    for (let outer = 0; outer < currentLength - 1; outer++) {
        let minimalIndex = outer;
        for (let inner = outer + 1; inner < currentLength; inner++) {
            if (numericValues[inner] < numericValues[minimalIndex]) {
                minimalIndex = inner;
            }
        }
        if (minimalIndex !== outer) {
            let temporary = numericValues[outer];
            numericValues[outer] = numericValues[minimalIndex];
            numericValues[minimalIndex] = temporary;
        }
    }
    return String.fromCharCode(...numericValues);
};

const arrangeDescending = (sourceString) => {
    let numericValues = Array.from(sourceString).map(symbol => symbol.charCodeAt(0));
    let currentLength = numericValues.length;

    for (let outer = 0; outer < currentLength - 1; outer++) {
        let maximalIndex = outer;
        for (let inner = outer + 1; inner < currentLength; inner++) {
            if (numericValues[inner] > numericValues[maximalIndex]) {
                maximalIndex = inner;
            }
        }
        if (maximalIndex !== outer) {
            let temporary = numericValues[outer];
            numericValues[outer] = numericValues[maximalIndex];
            numericValues[maximalIndex] = temporary;
        }
    }
    return String.fromCharCode(...numericValues);
};

const compareSequences = (firstOperand, secondOperand) => {
    let shorterLength = firstOperand.length < secondOperand.length ? firstOperand.length : secondOperand.length;
    for (let indexPosition = 0; indexPosition < shorterLength; indexPosition++) {
        let codeOne = firstOperand.charCodeAt(indexPosition);
        let codeTwo = secondOperand.charCodeAt(indexPosition);
        if (codeOne < codeTwo) {
            return true;
        }
        if (codeOne > codeTwo) {
            return false;
        }
    }
    return firstOperand.length < secondOperand.length;
};

const executeProgram = (rawData) => {
    const [initialTextA, initialTextB] = separateLines(rawData);

    const firstArrangement = arrangeAscending(initialTextA);
    const secondArrangement = arrangeDescending(initialTextB);

    if (compareSequences(firstArrangement, secondArrangement)) {
        console.log('Yes');
    } else {
        console.log('No');
    }
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));