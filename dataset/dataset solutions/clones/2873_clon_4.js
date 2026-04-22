const computationHandler = (rawDataSource) => {
    const [firstLineOfData, secondLineOfData] = rawDataSource.split('\n');
    const [elementQuantity, alphaIndex, betaIndex, gammaIndex, deltaIndex] = firstLineOfData.split(' ').map(Number);
    const characterStream = secondLineOfData;

    const collectionOfChecks = [];

    const conditionalModifierCheck = (gVal, dVal, bVal, charSeq) => {
        if (gVal <= dVal) {
            return true;
        }

        const effectiveEndPoint = (gVal - dVal <= 3) ? gVal : dVal;
        let modifiedCharSeq = charSeq;

        if (dVal - 2 >= 0 && dVal - 2 < charSeq.length && charSeq.charAt(dVal - 2) === '#') {
            if (dVal - 1 >= 0 && dVal - 1 < charSeq.length) {
                modifiedCharSeq = modifiedCharSeq.substring(0, dVal - 1) + '#' + modifiedCharSeq.substring(dVal);
            }
        }

        const relevantSegment = modifiedCharSeq.substring(bVal - 1, effectiveEndPoint);
        return relevantSegment.includes('...');
    };
    collectionOfChecks.push(conditionalModifierCheck(gammaIndex, deltaIndex, betaIndex, characterStream));

    collectionOfChecks.push(!characterStream.substring(alphaIndex - 1, gammaIndex).includes('##'));

    collectionOfChecks.push(!characterStream.substring(betaIndex - 1, deltaIndex).includes('##'));

    const ultimateDecision = collectionOfChecks.every(Boolean);

    return ultimateDecision ? 'Yes' : 'No';
};

const fileContentReader = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(computationHandler(fileContentReader));