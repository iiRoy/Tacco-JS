"use strict";

const processInput = (payload) => {
    const data = payload.trim().split('\n');
    const maximumValue = Number(data[0]);
    
    let countedSolutions = 0;

    const generateAndVerify = (currentNumber, hasThree, hasFive, hasSeven) => {
        if (currentNumber > maximumValue) {
            return;
        }

        if (currentNumber > 0 && hasThree && hasFive && hasSeven) {
            countedSolutions++;
        }

        const digitOptionA = 3;
        const digitOptionB = 5;
        const digitOptionC = 7;

        let nextNumber;

        nextNumber = currentNumber * 10 + digitOptionA;
        if (nextNumber <= maximumValue) {
            generateAndVerify(nextNumber, true, hasFive, hasSeven);
        }

        nextNumber = currentNumber * 10 + digitOptionB;
        if (nextNumber <= maximumValue) {
            generateAndVerify(nextNumber, hasThree, true, hasSeven);
        }

        nextNumber = currentNumber * 10 + digitOptionC;
        if (nextNumber <= maximumValue) {
            generateAndVerify(nextNumber, hasThree, hasFive, true);
        }
    };

    generateAndVerify(0, false, false, false);

    console.log(countedSolutions);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));