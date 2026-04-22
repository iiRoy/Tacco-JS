const processInputData = (inputStringContent) => {
    const linesOfData = inputStringContent.split('\n');

    const itemQuantity = parseInt(linesOfData[0], 10);
    const primarySequence = linesOfData[1].split(' ').map(Number);
    const secondarySequence = linesOfData[2].split(' ').map(Number);
    const tertiarySequence = linesOfData[3].split(' ').map(Number);

    const initialSecondarySum = secondarySequence.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const conditionalTertiarySum = Array.from({ length: itemQuantity - 1 })
        .map((_, index) => ({
            firstElement: primarySequence[index],
            secondElement: primarySequence[index + 1],
            correspondingItem: tertiarySequence[index]
        }))
        .filter(pair => pair.firstElement === pair.secondElement - 1)
        .reduce((accumulator, filteredPair) => accumulator + filteredPair.correspondingItem, 0);

    const finalCalculatedValue = initialSecondarySum + conditionalTertiarySum;

    console.log(finalCalculatedValue);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));