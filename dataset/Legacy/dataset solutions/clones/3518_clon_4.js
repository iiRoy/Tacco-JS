const parseInteger = (val) => Number.parseInt(val, 10);
const parseIntegerArray = (strArr) => strArr.map(parseInteger);
const absoluteValue = (num) => Math.abs(num);
const findMinimum = (...values) => Math.min(...values);
const findMaximum = (...values) => Math.max(...values);

const computeGCD = (...numbers) => {
    const gcdTwo = (a, b) => {
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    };
    return numbers.reduce(gcdTwo);
};

((inputContent) => {
    const processInputData = (rawInput) => {
        const inputLines = rawInput.split('\n');
        const totalPoints = parseInteger(inputLines[0]);
        const coordinateCollection = [];

        let initialPairSumParity = null;
        for (let i = 0; i < totalPoints; i++) {
            const currentCoordinatePair = parseIntegerArray(inputLines[i + 1].split(' '));
            coordinateCollection.push(currentCoordinatePair);

            const currentSumParity = (currentCoordinatePair[0] + currentCoordinatePair[1]) % 2;
            if (i === 0) {
                initialPairSumParity = currentSumParity;
            } else if (currentSumParity !== initialPairSumParity) {
                console.log(-1);
                return;
            }
        }

        if (initialPairSumParity === 1) {
            coordinateCollection.forEach((pairEntry) => {
                if (pairEntry[0] % 2 !== 0) {
                    [pairEntry[0], pairEntry[1]] = [pairEntry[1], pairEntry[0]];
                }
            });
        }

        let finalDimensionCount = 20;
        if (coordinateCollection[0][0] % 2 !== 0) finalDimensionCount++;
        if (coordinateCollection[0][1] % 2 !== 0) finalDimensionCount++;

        console.log(finalDimensionCount);

        const directionSequence = Array.from({ length: finalDimensionCount }, () => 1).join(' ');
        console.log(directionSequence);

        const generateRepeatedChar = (count, charSymbol) => {
            let segmentString = '';
            for (let k = 0; k < count; k++) {
                segmentString += charSymbol;
            }
            return segmentString;
        };

        coordinateCollection.forEach(pointData => {
            let currentXValue = pointData[0];
            let currentYValue = pointData[1];
            const pathSegments = [];

            if (currentXValue % 2 !== 0) {
                pathSegments.push('R');
                currentXValue++;
            }
            if (currentYValue % 2 !== 0) {
                pathSegments.push('R');
                currentYValue++;
            }

            pathSegments.push(generateRepeatedChar((10 + currentXValue) / 2, 'R'));
            pathSegments.push(generateRepeatedChar((10 - currentXValue) / 2, 'L'));
            pathSegments.push(generateRepeatedChar((10 + currentYValue) / 2, 'U'));
            pathSegments.push(generateRepeatedChar((10 - currentYValue) / 2, 'D'));

            console.log(pathSegments.join(''));
        });
    };

    processInputData(inputContent);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
