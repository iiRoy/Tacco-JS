const processNumbers = (dataPayload) => {
    const stringComponents = dataPayload.split(' ');
    const initialElements = [
        Number(stringComponents[0]),
        Number(stringComponents[1]),
        Number(stringComponents[2])
    ];

    const iterateTransformation = (currentTriplet, iterationCounter) => {
        if (iterationCounter >= 1000) {
            return -1;
        }

        const firstIsOdd = currentTriplet.first % 2 !== 0;
        const secondIsOdd = currentTriplet.second % 2 !== 0;
        const thirdIsOdd = currentTriplet.third % 2 !== 0;

        if (firstIsOdd || secondIsOdd || thirdIsOdd) {
            return iterationCounter;
        }

        const { first, second, third } = currentTriplet;
        const nextFirst = (second + third) / 2;
        const nextSecond = (first + third) / 2;
        const nextThird = (second + third) / 2;

        return iterateTransformation(
            { first: nextFirst, second: nextSecond, third: nextThird },
            iterationCounter + 1
        );
    };

    const finalResult = iterateTransformation(
        { first: initialElements[0], second: initialElements[1], third: initialElements[2] },
        0
    );

    console.log(finalResult);
};

const systemDataInterface = require("fs");
const rawDataAcquisition = systemDataInterface.readFileSync("/dev/stdin", "utf8");
processNumbers(rawDataAcquisition.trim());