function performCalculation(src) {
    const [alpha, beta, gamma, delta, epsilon] = src.split(" ").map(Number);

    const smallestOfTwo = (val1, val2) => val1 < val2 ? val1 : val2;
    const largestOfTwo = (val1, val2) => val1 > val2 ? val1 : val2;

    const lowerQuantity = smallestOfTwo(delta, epsilon);
    const higherQuantity = largestOfTwo(delta, epsilon);

    const initialPurchaseCost = lowerQuantity * alpha + lowerQuantity * beta;

    const combinedPurchaseCost = (lowerQuantity * gamma * 2) +
                                 ((delta - lowerQuantity) * alpha) +
                                 ((epsilon - lowerQuantity) * beta);

    const bulkPurchaseCost = higherQuantity * gamma * 2;

    const ultimatePrice = smallestOfTwo(initialPurchaseCost, smallestOfTwo(combinedPurchaseCost, bulkPurchaseCost));

    console.log(ultimatePrice);
}