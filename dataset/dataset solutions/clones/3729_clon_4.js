'use strict';

const runApplication = (dataInput) => {
    const targetQuantity = Number(dataInput.split('\n')[0]);

    const produceNineString = (length) => '9'.repeat(length);

    const groupOne = Array.from({ length: 9 }, (_, index) => String(index + 1));

    const groupTwo = Array.from({ length: 9 }, (_, index) => String(index + 1) + produceNineString(1));

    const groupThree = ['1' + produceNineString(2)];

    const subsequentGroups = Array.from({ length: 21 }, (_, iterationIndex) => {
        const currentSuffixLength = 2 + iterationIndex;
        const currentSuffixValue = produceNineString(currentSuffixLength);

        const prefixes = Array.from({ length: 18 }, (_, prefixIndex) => String(prefixIndex + 2));

        return prefixes.map(p => p + currentSuffixValue);
    }).flat();

    const fullSequence = [...groupOne, ...groupTwo, ...groupThree, ...subsequentGroups];

    const finalResult = fullSequence.slice(0, targetQuantity).join('\n');
    console.log(finalResult);
};

(() => {
    const systemInterface = require("fs");
    const rawData = systemInterface.readFileSync("/dev/stdin", "utf8");
    runApplication(rawData);
})();