const performModularAddition = (currentSum, valueToAdd, modulus) => {
    return (currentSum + valueToAdd) % modulus;
};

const parseInteger = (str) => parseInt(str, 10);

function processInput(rawData) {
    const MOD_CONSTANT = 1000000000 + 7;

    const inputLines = rawData.split("\n");

    const firstLineTokens = inputLines[0].split(" ");
    const arrayLength = parseInteger(firstLineTokens[0]);
    const multiplier = parseInteger(firstLineTokens[1]);

    const numberArray = inputLines[1].split(" ").map(parseInteger);

    let totalInversions = 0;

    for (let currentIdx = 0; currentIdx < arrayLength; currentIdx++) {
        const currentElement = numberArray[currentIdx];

        const elementsAfterCurrent = numberArray.slice(currentIdx + 1);
        const inversionsAfterCurrent = elementsAfterCurrent.filter(val => val < currentElement).length;

        const allElementsSmallerThanCurrent = numberArray.filter(val => val < currentElement);
        const totalSmallerElements = allElementsSmallerThanCurrent.length;

        const termOneContribution = inversionsAfterCurrent * multiplier;
        totalInversions = performModularAddition(totalInversions, termOneContribution, MOD_CONSTANT);

        const sumOfKMinusOne = (multiplier - 1) * multiplier / 2;

        const termTwoContribution = totalSmallerElements * sumOfKMinusOne;
        totalInversions = performModularAddition(totalInversions, termTwoContribution, MOD_CONSTANT);
    }

    console.log(totalInversions);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
