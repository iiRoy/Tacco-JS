const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataLines = fileContent.split("\n");

const computeSum = (numberArray) => {
    let accumulator = 0;
    for (const currentValue of numberArray) {
        accumulator += currentValue;
    }
    return accumulator;
};

const extractNumbers = (numCount, sourceLines) => {
    const extractedList = [];
    for (let k = 0; k < numCount; k++) {
        const lineData = sourceLines.shift();
        extractedList.push(parseInt(lineData.trim()));
    }
    return extractedList;
};

while (dataLines.length > 1) {
    const currentLineParts = dataLines.shift().trim().split(" ");
    const countA = Number(currentLineParts[0]);
    const countB = Number(currentLineParts[1]);

    const listA = extractNumbers(countA, dataLines);
    const listB = extractNumbers(countB, dataLines);

    const setB = new Set(listB);

    const sumA = computeSum(listA);
    const sumB = computeSum(listB);

    if (sumA === sumB) {
        listA.sort((valX, valY) => valX - valY);

        let commonValue = -1;
        const foundInBoth = listA.find(itemA => setB.has(itemA));
        
        if (foundInBoth !== undefined) {
            commonValue = foundInBoth;
        }

        if (commonValue === -1) {
            console.log(-1);
        } else {
            console.log(commonValue + ' ' + commonValue);
        }
    } else {
        const totalSum = sumA + sumB;
        if (totalSum % 2 !== 0) {
            console.log(-1);
        } else {
            const targetHalfSum = totalSum / 2;
            let bestValA = null;
            let bestValB = null;
            let currentMinPairSum = 201;

            for (let index = 0; index < countA; index++) {
                const candidateValA = listA[index];
                const requiredValB = targetHalfSum - sumA + candidateValA;

                if (setB.has(requiredValB)) {
                    const potentialPairSum = candidateValA + requiredValB;
                    if (currentMinPairSum > potentialPairSum) {
                        currentMinPairSum = potentialPairSum;
                        bestValA = candidateValA;
                        bestValB = requiredValB;
                    }
                }
            }

            if (currentMinPairSum < 201) {
                console.log(bestValA + ' ' + bestValB);
            } else {
                console.log(-1);
            }
        }
    }
}
