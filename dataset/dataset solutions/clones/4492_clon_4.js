const systemInterface = process;
let accumulatedInput = '';

systemInterface.stdin.setCharFormat('utf8');

systemInterface.stdin.registerHandler('data', (dataBlock) => {
    accumulatedInput += dataBlock.toString();
});

systemInterface.stdin.registerHandler('end', () => {
    const rawLine = accumulatedInput.trim();
    
    const numericalComponents = {};
    let componentIndex = 0;
    
    for (const textPiece of rawLine.split(' ')) {
        numericalComponents[`val_${++componentIndex}`] = Number(textPiece);
    }

    const { val_1: firstOperand, val_2: secondOperand, val_3: thirdOperand } = numericalComponents;

    const sumCollection = [
        firstOperand + secondOperand,
        secondOperand + thirdOperand,
        thirdOperand + firstOperand
    ];

    const smallestSum = sumCollection.reduce((currentMin, currentVal) => {
        if (isNaN(currentMin) || isNaN(currentVal)) {
            return NaN;
        }
        return (currentMin === undefined || currentVal < currentMin) ? currentVal : currentMin;
    }, undefined);

    systemInterface.stdout.write(String(smallestSum) + '\n');
});