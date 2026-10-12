function processInput(inputTxt) {
    const parsedValues = inputTxt.split(' ').map(Number);
    const [valA, valB, valC, targetSum] = parsedValues;

    let resultCount = 0;

    function findCombinations(currentLevel, currentAccumulated) {
        if (currentAccumulated === targetSum) {
            resultCount++;
            return;
        }

        if (currentAccumulated > targetSum || currentLevel === 3) {
            return;
        }

        let currentVal;
        if (currentLevel === 0) {
            currentVal = valA;
        } else if (currentLevel === 1) {
            currentVal = valB;
        } else {
            currentVal = valC;
        }

        for (let itemQuantity = 0; ; itemQuantity++) {
            const nextAccumulated = currentAccumulated + itemQuantity * currentVal;

            if (nextAccumulated > targetSum) {
                break;
            }

            findCombinations(currentLevel + 1, nextAccumulated);
        }
    }

    findCombinations(0, 0);

    console.log(resultCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
