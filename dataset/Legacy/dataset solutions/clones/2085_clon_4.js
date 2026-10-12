function Main(input) {
  const allInputLines = input.split("\n");

  const [countA, countB, maxCoupons] = allInputLines[0].split(" ").map(Number);

  const refrigeratorCosts = allInputLines[1].split(" ").map(Number);

  const electronicsCosts = allInputLines[2].split(" ").map(Number);

  const couponOffers = allInputLines.slice(3).map(line => line.split(" ").map(Number));

  const minimumRefrigeratorCost = refrigeratorCosts.reduce((currentMin, price) => (price < currentMin ? price : currentMin), Infinity);

  const minimumElectronicsCost = electronicsCosts.reduce((currentMin, price) => (price < currentMin ? price : currentMin), Infinity);

  const initialCombinedMinimum = minimumRefrigeratorCost + minimumElectronicsCost;

  const finalLowestPrice = couponOffers.reduce((currentOverallLowest, offerDetails) => {
    const [refIndex, eleIndex, discountValue] = offerDetails;
    const actualRefPrice = refrigeratorCosts[refIndex - 1];
    const actualElePrice = electronicsCosts[eleIndex - 1];
    const priceWithCoupon = actualRefPrice + actualElePrice - discountValue;
    return priceWithCoupon < currentOverallLowest ? priceWithCoupon : currentOverallLowest;
  }, initialCombinedMinimum);

  console.log(finalLowestPrice);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
