function processData(sourceContent) {
    const contentLines = sourceContent.split('\n');
    const numericalIdentifier = +contentLines[0]; // Using unary plus for numeric conversion

    const sourceNumbers = contentLines[1].split(' ').map(Number); // Using Number constructor for conversion

    // Different approach for finding the median of three values
    const obtainMedianOfThree = (valueX, valueY, valueZ) =>
        Math.max(Math.min(valueX, valueY), Math.min(valueY, valueZ), Math.min(valueX, valueZ));

    // Recursive function to apply the reduction until a single element remains
    const collapseSequence = (currentList) => {
        // Base case: if the list has only one element, return it
        if (currentList.length === 1) {
            return currentList[0];
        }

        // Determine the size of the next, reduced list
        const reducedListSize = currentList.length - 2;

        // Generate the next list using functional array methods
        // Array.from creates a new array and maps each index to a value
        const nextIterationList = Array.from({ length: reducedListSize }, (_, position) => {
            const firstNum = currentList[position];
            const secondNum = currentList[position + 1];
            const thirdNum = currentList[position + 2];
            return obtainMedianOfThree(firstNum, secondNum, thirdNum);
        });

        // Recursively call the function with the newly generated list
        return collapseSequence(nextIterationList);
    };

    const finalResult = collapseSequence(sourceNumbers);

    console.log(finalResult);
}
processData(require("fs").readFileSync("/dev/stdin", "utf8"));