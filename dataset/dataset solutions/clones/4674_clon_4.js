"use strict";

const processInputData = (inputContent) => {
    const [initialChar, secondaryChar] = inputContent.split("\n")[0].split(" ");

    const charToBit = new Map([
        ["D", 1],
        ["H", 0]
    ]);

    const bitToChar = new Map([
        [1, "D"],
        [0, "H"]
    ]);

    const bitA = charToBit.get(initialChar);
    const bitB = charToBit.get(secondaryChar);

    const resultBit = bitA ^ bitB;

    const finalResultChar = bitToChar.get(resultBit);
    
    console.log(finalResultChar);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
