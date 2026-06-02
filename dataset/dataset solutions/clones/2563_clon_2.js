function ProcessInput(rawData) {
  // Divide the complete input string into an array of lines.
  let lineSegments = rawData.split("\n");

  // Extract numerical parameters from the first line of input.
  let initialParams = lineSegments[0].split(" ");
  const itemCount = Number.parseInt(initialParams[0], 10); // Represents N, the number of items.
  const couponCount = Number.parseInt(initialParams[1], 10); // Represents M, the total coupons available.

  // Process the second line to obtain the initial prices of the items.
  let itemPricesStr = lineSegments[1].split(" ");
  // Convert the string representations of prices into an array of integers.
  let priceList = itemPricesStr.map( (strVal) => Number.parseInt(strVal, 10));

  // Initialize a counter to keep track of the coupons that have been applied.
  let couponUsed = 0;

  // Apply the coupon reduction logic based on whether there's more than one item.
  if (itemCount > 1) {
    // Continue applying coupons as long as there are coupons remaining to be used.
    while (couponUsed < couponCount) {
      // Determine the highest price currently present in the list of items.
      let currentMaxPrice = Math.max.apply(null, priceList);

      // Find the index of the first item that has this maximum price.
      let maxPriceIndex = 0;
      for (let k = 0; k < itemCount; k++) {
        if (priceList[k] === currentMaxPrice) {
          maxPriceIndex = k;
          break; // Stop searching once the first occurrence is found.
        }
      }

      // Calculate the aggregate sum of all current item prices.
      let totalPriceSum = priceList.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue;
      });

      // Compute the number of reduction steps to apply to the highest priced item.
      // This is based on its price relative to the total sum, rounded up.
      let reductionSteps = Math.ceil(priceList[maxPriceIndex] / totalPriceSum);

      // Adjust the calculated reduction steps if applying them would exceed the remaining coupons.
      if (reductionSteps + couponUsed >= couponCount) {
        reductionSteps = couponCount - couponUsed;
      }

      // Apply the price reduction: divide the item's price by 2 raised to the power of reductionSteps, then floor the result.
      priceList[maxPriceIndex] = Math.floor(priceList[maxPriceIndex] / Math.pow(2, reductionSteps));
      // Update the total count of coupons that have been utilized.
      couponUsed += reductionSteps;
    }
  } else {
    // If there is only one item, all coupons are applied directly to that single item.
    priceList[0] = Math.floor(priceList[0] / Math.pow(2, couponCount));
  }

  // Compute the final sum of all item prices after all reductions and output this sum to the console.
  console.log(priceList.reduce(function(accumulator, currentValue) {
    return accumulator + currentValue;
  }));
}

// Read the input data from standard input using Node.js's file system module and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
