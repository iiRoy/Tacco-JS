function Main(inputString) {
    const [priceA, priceB, priceAB, countA, countB] = inputString.split(' ').map(Number);

    const optionOneCost = Math.min(countA, countB) * (priceA + priceB);

    const optionTwoCost = Math.min(countA, countB) * priceAB * 2 +
                          Math.abs(countA - countB) * (countA > countB ? priceA : priceB);

    const optionThreeCost = Math.max(countA, countB) * priceAB * 2;

    const finalMinimumPrice = Math.min(optionOneCost, optionTwoCost, optionThreeCost);

    console.log(finalMinimumPrice);
}
Main("1500 2000 1600 3 2");
Main("1500 2000 1900 3 2");
Main("1500 2000 500 90000 100000");
