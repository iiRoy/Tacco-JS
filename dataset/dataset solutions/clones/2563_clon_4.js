const locatePeakValue = (valueList) => {
    let highestValue = -1;
    let highestIndex = -1;
    valueList.forEach((currentValue, currentIndex) => {
        if (currentValue > highestValue) {
            highestValue = currentValue;
            highestIndex = currentIndex;
        }
    });
    return { value: highestValue, index: highestIndex };
};

const calculateTotalSum = (valueList) => valueList.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

const applyDiscountRounds = (currentItemsState, remainingCouponCount) => {
    if (remainingCouponCount <= 0) {
        return currentItemsState;
    }

    const { value: currentPeakPrice, index: peakPricePosition } = locatePeakValue(currentItemsState);
    const currentAggregateSum = calculateTotalSum(currentItemsState);

    let couponsForThisItem = Math.ceil(currentPeakPrice / currentAggregateSum);

    couponsForThisItem = Math.min(couponsForThisItem, remainingCouponCount);

    const nextItemsState = [...currentItemsState];
    nextItemsState[peakPricePosition] = Math.floor(currentPeakPrice / (2 ** couponsForThisItem));

    return applyDiscountRounds(nextItemsState, remainingCouponCount - couponsForThisItem);
};


function processInputAndCalculate(rawInput) {
    const [initialLine, itemPricesLine] = rawInput.split("\n");
    const [itemQuantity, totalCoupons] = initialLine.split(" ").map(Number);
    let itemPriceArray = itemPricesLine.split(" ").map(Number);

    let finalPrices;

    if (itemQuantity === 1) {
        finalPrices = [Math.floor(itemPriceArray[0] / (2 ** totalCoupons))];
    } else {
        finalPrices = applyDiscountRounds(itemPriceArray, totalCoupons);
    }

    const finalAggregate = calculateTotalSum(finalPrices);
    console.log(finalAggregate);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
