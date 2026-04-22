const evaluateData = (sourceText) => {
    const dataLines = sourceText.split('\n');
    const quantity = Number(dataLines[0]);
    const rawValues = dataLines[1].split(' ').map(Number);

    const arrangedValues = rawValues.sort((first, second) => second - first);

    const positiveCount = Math.ceil(quantity / 2);
    const negativeCount = Math.floor(quantity / 2);

    const largestSum = arrangedValues.slice(0, positiveCount).reduce((total, val) => total + val, 0);
    const smallestSum = arrangedValues.slice(quantity - negativeCount).reduce((total, val) => total + val, 0);

    const ultimateSum = largestSum - smallestSum;
    console.log(ultimateSum);

    let currentAccumulation;
    let leftPointer = 0;
    let rightPointer = quantity - 1;

    if (quantity % 2 === 0) {
        currentAccumulation = arrangedValues[rightPointer--];
    } else {
        currentAccumulation = arrangedValues[leftPointer++];
    }

    Array.from({ length: quantity - 1 }).reduce((accumulator, _, stepIndex) => {
        let valueForOperation;
        if (quantity % 2 === 0) {
            if (stepIndex % 2 === 0) {
                valueForOperation = arrangedValues[accumulator.left++];
            } else {
                valueForOperation = arrangedValues[accumulator.right--];
            }
        } else {
            if (stepIndex % 2 === 0) {
                valueForOperation = arrangedValues[accumulator.right--];
            } else {
                valueForOperation = arrangedValues[accumulator.left++];
            }
        }
        console.log(`${valueForOperation} ${accumulator.current}`);
        accumulator.current = valueForOperation - accumulator.current;
        return accumulator;
    }, { current: currentAccumulation, left: leftPointer, right: rightPointer });
};

evaluateData(require("fs").readFileSync("/dev/stdin", "utf8"));