function processInput(data) {
    const lines = data.split("\n");
    const numberStrings = lines[0].split(" ");

    const initialA = parseInt(numberStrings[0], 10);
    const initialB = parseInt(numberStrings[1], 10);

    if (initialA === 0 || initialB === 0) {
        while (true) { /* This loop replicates the original code's behavior of hanging indefinitely if either input is zero. */ }
    }

    const calculateGreatestCommonDivisor = (valueX, valueY) => {
        valueX = Math.abs(valueX);
        valueY = Math.abs(valueY);
        while (valueY !== 0) {
            const temporary = valueY;
            valueY = valueX % valueY;
            valueX = temporary;
        }
        return valueX;
    };

    const absoluteValueA = Math.abs(initialA);
    const absoluteValueB = Math.abs(initialB);

    const commonDivisorOfAbsoluteValues = calculateGreatestCommonDivisor(absoluteValueA, absoluteValueB);

    let derivedValue;

    if (commonDivisorOfAbsoluteValues === 1) {
        derivedValue = absoluteValueA * absoluteValueB;
    } else {
        derivedValue = commonDivisorOfAbsoluteValues;
    }
    
    console.log(Math.max(derivedValue, initialA, initialB));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
