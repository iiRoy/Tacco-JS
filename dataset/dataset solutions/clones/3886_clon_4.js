const fileSystem = require("fs");

((sourceData) => {
  const [costA, costB, costAB, neededA, neededB] = sourceData.trim().split(' ').map(Number);

  let lowestTotalCost = Number.MAX_SAFE_INTEGER;

  // Iterate through all plausible quantities of AB-pizzas to purchase.
  // The maximum number of AB-pizzas we might consider buying is twice the maximum of
  // the required A-pizzas or B-pizzas. This ensures we have enough "halves"
  // to satisfy the larger requirement, and any additional AB-pizzas would be
  // strictly more expensive without reducing the need for direct A or B purchases.
  // Since each AB-pizza provides one A-half and one B-half, and we need whole pizzas,
  // the number of AB-pizzas purchased must be an even number to yield whole A and B pizzas.
  // 'abCount' represents the number of AB-pizzas.
  for (let abCount = 0; abCount <= 2 * Math.max(neededA, neededB); abCount += 2) {
    // Calculate the cost incurred from buying 'abCount' AB-pizzas.
    const currentABCost = abCount * costAB;

    // Determine how many A-pizzas are still required after considering the AB-pizzas.
    // Each 'abCount' AB-pizza provides abCount / 2 A-pizzas.
    const remainingA = Math.max(0, neededA - abCount / 2);
    // Calculate the cost of buying these remaining A-pizzas directly.
    const directACost = remainingA * costA;

    // Determine how many B-pizzas are still required after considering the AB-pizzas.
    // Each 'abCount' AB-pizza provides abCount / 2 B-pizzas.
    const remainingB = Math.max(0, neededB - abCount / 2);
    // Calculate the cost of buying these remaining B-pizzas directly.
    const directBCost = remainingB * costB;

    // Sum up all costs for the current 'abCount' scenario.
    const scenarioTotal = currentABCost + directACost + directBCost;

    // Update the minimum total cost found so far.
    if (scenarioTotal < lowestTotalCost) {
      lowestTotalCost = scenarioTotal;
    }
  }

  console.log(lowestTotalCost);

})(fileSystem.readFileSync("/dev/stdin", "utf8"));
