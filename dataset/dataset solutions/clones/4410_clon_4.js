const fileSystemInterface = require("fs");

const largePrimeDivisor = 1000000007;

const singleBlockCoefficients = new Map([
    [0, 3], 
    [1, 2], 
    [2, 1]  
]);

const doubleBlockCoefficients = new Map([
    [0, 6], 
    [1, 2], 
    [2, 3]  
]);

function computePatternCombinations(
    currentLocation,
    cumulativeProduct,
    previousPatternKind,
    totalItems,
    firstItemCollection,
    secondItemCollection
) {
    if (currentLocation >= totalItems) {
        return cumulativeProduct;
    }

    let nextProductValue;
    let nextPatternKind;
    let nextLocationIndex;

    if (firstItemCollection[currentLocation] === secondItemCollection[currentLocation]) {
        const coefficient = singleBlockCoefficients.get(previousPatternKind);
        nextProductValue = (cumulativeProduct * coefficient) % largePrimeDivisor;
        nextPatternKind = 1; 
        nextLocationIndex = currentLocation + 1;
    } else {
        const coefficient = doubleBlockCoefficients.get(previousPatternKind);
        nextProductValue = (cumulativeProduct * coefficient) % largePrimeDivisor;
        nextPatternKind = 2; 
        nextLocationIndex = currentLocation + 2;
    }

    return computePatternCombinations(
        nextLocationIndex,
        nextProductValue,
        nextPatternKind,
        totalItems,
        firstItemCollection,
        secondItemCollection
    );
}

function orchestrateCalculation(inputContent) {
    const contentLines = inputContent.split("\n");
    const countOfElements = Number(contentLines[0]);
    const primaryElementSequence = contentLines[1].split("");
    const secondaryElementSequence = contentLines[2].split("");

    const finalResult = computePatternCombinations(
        0, 
        1, 
        0, 
        countOfElements,
        primaryElementSequence,
        secondaryElementSequence
    );

    console.log(finalResult);
}

const rawStreamData = fileSystemInterface.readFileSync("/dev/stdin", "UTF-8");
orchestrateCalculation(rawStreamData);