const acquireDataBlock = () => require("fs").readFileSync("/dev/stdin","utf8");

const determineParityStatus = (numValue) => (numValue % 2 === 0);

const calculateSumComponentCounts = (targetValue) => {
    let resultantCount = 0;
    const doubledTarget = targetValue << 1;
    const boundaryValue = Math.sqrt(doubledTarget);

    for (let primaryDivisor = 2; primaryDivisor <= boundaryValue; primaryDivisor++) {
        if (doubledTarget % primaryDivisor === 0) {
            const secondaryDivisor = doubledTarget / primaryDivisor;

            const isPrimaryDivisorEven = determineParityStatus(primaryDivisor);
            const isSecondaryDivisorEven = determineParityStatus(secondaryDivisor);

            if (isPrimaryDivisorEven !== isSecondaryDivisorEven) {
                if (secondaryDivisor - primaryDivisor + 1 >= 0) {
                    resultantCount++;
                }
            }

            if (primaryDivisor * primaryDivisor !== doubledTarget) {
                if (isSecondaryDivisorEven !== isPrimaryDivisorEven) {
                    if (primaryDivisor - secondaryDivisor + 1 >= 0) {
                        resultantCount++;
                    }
                }
            }
        }
    }
    return resultantCount;
};

const processInputSequence = (rawData) => {
    const rawLines = rawData.split('\n');
    const numericalResults = [];

    for (const lineEntry of rawLines) {
        const parsedNumber = parseInt(lineEntry, 10);

        if (isNaN(parsedNumber)) {
            continue;
        }

        if (parsedNumber === 0) {
            break;
        }
        
        numericalResults.push(calculateSumComponentCounts(parsedNumber));
    }

    return numericalResults.join('\n');
};

console.log(processInputSequence(acquireDataBlock()));