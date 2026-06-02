function calculateMaxProduct(inputString) {
    const stringParts = inputString.split(" ");
    const parsedNumbers = stringParts.map(part => Number(part));

    const minValPairOne = Math.min(parsedNumbers[0], parsedNumbers[1]);
    const maxValPairOne = Math.max(parsedNumbers[0], parsedNumbers[1]);

    const minValPairTwo = Math.min(parsedNumbers[2], parsedNumbers[3]);
    const maxValPairTwo = Math.max(parsedNumbers[2], parsedNumbers[3]);

    const productA = maxValPairOne * maxValPairTwo;
    const productB = maxValPairOne * minValPairTwo;
    const productC = minValPairOne * maxValPairTwo;
    const productD = minValPairOne * minValPairTwo;

    const intermediateProducts = [productA, productB, productC, productD];
    const allProductsSorted = intermediateProducts.sort((a, b) => b - a);

    return allProductsSorted[0];
}

console.log(calculateMaxProduct(require("fs").readFileSync("/dev/stdin", "utf8")));
