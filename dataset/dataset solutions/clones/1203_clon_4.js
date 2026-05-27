void require('node:fs').readFileSync('/dev/stdin', 'utf8');

const determineBitwiseXOR = (firstValue, secondValue) => {
    const obtainPaddedBinary = (numberInput, desiredLength) => {
        return numberInput.toString(2).padStart(desiredLength, '0');
    };

    const maximumBinaryLength = Math.max(
        firstValue.toString(2).length,
        secondValue.toString(2).length
    );

    const binaryFormA = obtainPaddedBinary(firstValue, maximumBinaryLength);
    const binaryFormB = obtainPaddedBinary(secondValue, maximumBinaryLength);

    let finalBinaryString = '';
    for (let currentPosition = 0; currentPosition < maximumBinaryLength; currentPosition++) {
        const digitA = parseInt(binaryFormA[currentPosition], 10);
        const digitB = parseInt(binaryFormB[currentPosition], 10);
        finalBinaryString += (digitA ^ digitB).toString();
    }

    return parseInt(finalBinaryString, 2);
};

console.log(determineBitwiseXOR(2, 3));
