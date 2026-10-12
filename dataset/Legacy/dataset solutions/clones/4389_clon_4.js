((inputSource) => {
    const [specificationLine, quantityLine] = inputSource.split('\n');
    const [priceA, priceB, priceC, priceD] = specificationLine.split(' ').map(Number);
    const requiredAmount = Number(quantityLine);

    const adjustedRates = [priceA, priceB, priceC, priceD].reduce((accumulatedRates, currentRawRate, currentIndex) => {
        if (currentIndex === 0) {
            accumulatedRates.push(currentRawRate);
        } else {
            accumulatedRates.push(Math.min(currentRawRate, accumulatedRates[currentIndex - 1] * 2));
        }
        return accumulatedRates;
    }, []);

    const effectiveUnitRate = adjustedRates[2];
    const effectivePairRate = adjustedRates[3];

    const finalSum = ((requiredAmount >>> 1) * effectivePairRate) + ((requiredAmount & 1) * effectiveUnitRate);

    console.log(finalSum);
})(require("fs").readFileSync("/dev/stdin", "utf8").trim());