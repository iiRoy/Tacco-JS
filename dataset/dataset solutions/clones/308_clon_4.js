const CALC_CONSTANT_DIV = 0.000003305785;
const FINAL_DIVISOR = 1000000;

const integerBelow = (numericalValue) => {
    if (typeof numericalValue !== 'number' || isNaN(numericalValue)) {
        return NaN;
    }
    if (numericalValue === Infinity || numericalValue === -Infinity) {
        return numericalValue;
    }
    if (numericalValue >= 0) {
        return numericalValue | 0;
    } else {
        return (numericalValue === (numericalValue | 0)) ? numericalValue : ((numericalValue | 0) - 1);
    }
};

const clipWhitespace = (phrase) => {
    let front = 0;
    let back = phrase.length - 1;

    const isSpaceChar = (char) => /\s/.test(char);

    while (front <= back && isSpaceChar(phrase[front])) {
        front++;
    }

    while (back >= front && isSpaceChar(phrase[back])) {
        back--;
    }

    return phrase.substring(front, back + 1);
};

const segmentString = (fullString) => {
    let pieces = [];
    let currentPiece = '';
    let modifiedString = clipWhitespace(fullString);

    const isSpaceChar = (char) => /\s/.test(char);

    for (let pos = 0; pos < modifiedString.length; pos++) {
        const character = modifiedString[pos];
        if (isSpaceChar(character)) {
            if (currentPiece !== '') {
                pieces.push(currentPiece);
                currentPiece = '';
            }
            pieces.push('');
        } else {
            currentPiece += character;
        }
    }
    if (currentPiece !== '') {
        pieces.push(currentPiece);
    }
    return pieces;
};

const performCalculation = (valA, valB) => {
    const intermediateProduct = valA * valB;
    const preFloorValue = intermediateProduct / CALC_CONSTANT_DIV;
    const flooredResult = integerBelow(preFloorValue);
    return flooredResult / FINAL_DIVISOR;
};

let collectedInput = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingData) => {
    collectedInput += incomingData;
});

process.stdin.on('end', () => {
    const segmentedInput = segmentString(collectedInput);
    const numericSegmentA = Number(segmentedInput[0]);
    const numericSegmentB = Number(segmentedInput[1]);

    const finalOutput = performCalculation(numericSegmentA, numericSegmentB);

    process.stdout.write(finalOutput.toString() + '\n');
});