(function() {
    const analyzeInputData = (fileContent) => {
        const targetLine = fileContent.split('\n')[0];
        const digitsCollection = targetLine.match(/\d+/g);

        const numericalUnits = digitsCollection ? digitsCollection.reduce((accArray, numString) => {
            accArray.push(Number(numString));
            return accArray;
        }, []) : [];

        const firstValue = numericalUnits[0];
        const secondValue = numericalUnits[1];
        const thirdValue = numericalUnits[2];

        const pairSumOne = firstValue + secondValue;
        const pairSumTwo = secondValue + thirdValue;
        const pairSumThree = thirdValue + firstValue;

        const calculatedSums = [pairSumOne, pairSumTwo, pairSumThree];

        let minimalOutcome = NaN;

        for (let counter = 0; counter < calculatedSums.length; counter++) {
            const currentSum = calculatedSums[counter];
            if (isNaN(currentSum)) {
                return NaN;
            }
            if (isNaN(minimalOutcome) || currentSum < minimalOutcome) {
                minimalOutcome = currentSum;
            }
        }
        return minimalOutcome;
    };

    const receivedContent = require("fs").readFileSync("/dev/stdin", "utf8");
    console.log(analyzeInputData(receivedContent));
})();