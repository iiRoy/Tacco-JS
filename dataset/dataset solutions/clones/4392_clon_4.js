const fileSystem = require("node:fs");

const acquiredText = fileSystem.readFileSync("/dev/stdin", "utf8").trim();

let textualSegments = acquiredText.split("\n");

const retrieveNextSegment = () => {
    if (textualSegments.length === 0) {
        throw new Error("Source exhaustion detected.");
    }
    return textualSegments.shift();
};

const parseIntegerSet = (lineContent) => lineContent.split(" ").map(Number);
const parseSingleInteger = (lineContent) => Number(lineContent);

const findMinimumValue = (collection) => collection.reduce((currentMin, element) => (element < currentMin ? element : currentMin), Infinity);

const deriveCostRates = (initialCharges) => {
    const [quarterCharge, halfCharge, singleCharge, doubleCharge] = initialCharges;

    const chargesForOneLiter = findMinimumValue([
        quarterCharge * 4,
        halfCharge * 2,
        singleCharge
    ]);

    const chargesForTwoLiters = findMinimumValue([
        quarterCharge * 8,
        halfCharge * 4,
        singleCharge * 2,
        doubleCharge
    ]);

    return { singleUnitCost: chargesForOneLiter, doubleUnitCost: chargesForTwoLiters };
};

const determineFinalPrice = (volumeRequired, rateInformation) => {
    const { singleUnitCost, doubleUnitCost } = rateInformation;

    const twoLiterCount = Math.floor(volumeRequired / 2);
    const oneLiterCount = volumeRequired % 2;

    return (twoLiterCount * doubleUnitCost) + (oneLiterCount * singleUnitCost);
};

const executeProcessing = () => {
    const firstLineValues = parseIntegerSet(retrieveNextSegment());
    const targetVolume = parseSingleInteger(retrieveNextSegment());

    const { singleUnitCost, doubleUnitCost } = deriveCostRates(firstLineValues);

    const finalResult = determineFinalPrice(targetVolume, { singleUnitCost, doubleUnitCost });

    console.log(finalResult);
};

executeProcessing();