function processData(rawData) {
    const dataLines = rawData.split('\x0A');
    const firstLineValues = dataLines[0].split(/\s+/);
    const primaryInputVal = Number.parseInt(firstLineValues[0], 10);

    // Replicating the original code's behavior where the second value is also the first value
    const secondaryInputVal = primaryInputVal;

    // First condition check: (X+Y) must be divisible by 3
    if ( (primaryInputVal + secondaryInputVal) % 3 !== 0 ) {
        console.info(0);
        return;
    }

    // Calculate 'a' and 'b' for path steps
    const typeA_steps = ( (secondaryInputVal * 2) - primaryInputVal ) / 3;
    const typeB_steps = secondaryInputVal - (typeA_steps * 2);

    // Second condition check: 'a' and 'b' must not be negative
    if ( Math.min(typeA_steps, typeB_steps) < 0 ) {
        console.info(0);
        return;
    }

    // Calculate combinations C(N, K) where N = a+b, K = min(a,b)
    const totalPossibleSteps = typeA_steps + typeB_steps;
    const stepsToChoose = Math.min(typeA_steps, typeB_steps);

    // Helper function to calculate the product of 'count' numbers starting from 'start' downwards
    function calculateDescendingProduct(startValue, countItems) {
        let currentProduct = 1;
        for (let j = 0; j < countItems; j++) {
            currentProduct *= (startValue - j);
        }
        return currentProduct;
    }

    // Helper function to calculate factorial
    function calculateSequentialProduct(numberVal) {
        let sequentialProduct = 1;
        for (let j = 1; j <= numberVal; j++) {
            sequentialProduct *= j;
        }
        return sequentialProduct;
    }

    const numeratorPart = calculateDescendingProduct(totalPossibleSteps, stepsToChoose);
    const denominatorPart = calculateSequentialProduct(stepsToChoose);

    console.info(numeratorPart / denominatorPart);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));