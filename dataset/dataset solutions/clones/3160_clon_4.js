const calculateResult = (sourceTextContent) => {
    const targetSegment = sourceTextContent.split('\n')[0];

    const digitZeroes = (targetSegment.match(/0/g) || []).length;
    const digitOnes = (targetSegment.match(/1/g) || []).length;
    
    const smallerQuantity = (digitZeroes < digitOnes) ? digitZeroes : digitOnes;
    
    return smallerQuantity * 2;
};

const retrievedContent = require('fs').readFileSync('/dev/stdin', 'utf-8');
const computedValue = calculateResult(retrievedContent);
process.stdout.write(computedValue.toString() + '\n');