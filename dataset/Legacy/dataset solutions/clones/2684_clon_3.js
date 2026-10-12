function processData(rawInputString) {
    const lines = rawInputString.split("\n");
    const numElements = parseInt(lines[0], 10);
    const heightValues = lines[1].split(" ").map(val => parseInt(val, 10));

    let canBeDecreased = 'Yes';
    const MAX_ALLOWED_HEIGHT_DIFFERENCE = 1;

    for (let currentIndex = numElements - 1; currentIndex > 0; currentIndex--) {
        const previousElementIndex = currentIndex - 1;
        let heightAtPrevious = heightValues[previousElementIndex];
        const heightAtCurrent = heightValues[currentIndex];

        const calculatedDifference = heightAtPrevious - heightAtCurrent;

        if (calculatedDifference > MAX_ALLOWED_HEIGHT_DIFFERENCE) {
            canBeDecreased = 'No';
            break;
        } else if (calculatedDifference === MAX_ALLOWED_HEIGHT_DIFFERENCE) {
            heightValues[previousElementIndex] = heightAtPrevious - 1;
        }
    }

    console.log(canBeDecreased);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
