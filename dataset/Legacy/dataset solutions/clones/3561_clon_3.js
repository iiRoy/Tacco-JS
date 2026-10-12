function computeValueProduct(numericValue) {
    const halfOfValue = numericValue / 2;

    if (numericValue % 2 === 1) {
        let floorComponent = Math.floor(halfOfValue);
        let ceilComponent = Math.ceil(halfOfValue);
        return floorComponent * ceilComponent;
    } else {
        let squaredComponent = halfOfValue * halfOfValue;
        return squaredComponent;
    }
}

function processInput(rawInputString) {
    const parsedInteger = parseInt(rawInputString.trim());
    const finalResult = computeValueProduct(parsedInteger);
    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
