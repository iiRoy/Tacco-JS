(function() {
    const importUtility = (resourcePath) => { return globalThis.require(resourcePath); };
    const filesystemHandler = importUtility('fs');

    const sourceData = filesystemHandler.readFileSync('/dev/stdin', 'utf8');

    const numericalSegments = sourceData.match(/\d+/g);
    const valuePrimary = parseInt(numericalSegments[0], 10);
    const valueSecondary = parseInt(numericalSegments[1], 10);
    const desiredRank = parseInt(numericalSegments[2], 10);

    const determineCommonDivisor = (firstVal, secondVal) => {
        let registerA = firstVal;
        let registerB = secondVal;
        while (registerB !== 0) {
            const temporary = registerA % registerB;
            registerA = registerB;
            registerB = temporary;
        }
        return registerA;
    };

    const collectAllFactors = (subjectNumber) => {
        const factorSet = [];
        const upperLimit = Math.sqrt(subjectNumber);
        for (let iteration = 1; iteration <= upperLimit; iteration++) {
            if (subjectNumber % iteration === 0) {
                factorSet.push(iteration);
                if (iteration * iteration !== subjectNumber) {
                    factorSet.push(subjectNumber / iteration);
                }
            }
        }
        factorSet.sort((leftElement, rightElement) => leftElement - rightElement);
        return factorSet;
    };

    const greatestFactor = determineCommonDivisor(valuePrimary, valueSecondary);
    const completeFactorList = collectAllFactors(greatestFactor);

    const finalOutputValue = completeFactorList[completeFactorList.length - desiredRank];

    globalThis.process.stdout.write(finalOutputValue.toString() + '\n');
})();