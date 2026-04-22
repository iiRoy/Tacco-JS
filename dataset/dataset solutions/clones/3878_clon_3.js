function calculateOptimalPizzaCost(orderConfigurationString) {
    // This function determines the minimum expenditure for a pizza order
    // given individual pizza costs and a special combined pizza offer.

    // Step 1: Deconstruct the input string into its constituent parts.
    // The input string is expected to contain five space-separated numerical values.
    // Original: let input = input.split(" ");
    const configurationElements = orderConfigurationString.split(" ");

    // Step 2: Implement basic validation for the input format.
    // If the number of elements is not as expected, log an error and terminate.
    // This is an added guard clause (Type III change).
    if (configurationElements.length !== 5) {
        console.error("Input format error: Expected 5 numeric parameters for pizza costs and quantities.");
        // A robust application might throw an exception or return a specific error code here.
        return null;
    }

    // Step 3: Parse the string elements into numeric types.
    // Using `const` for values that do not change (Type II change).
    const priceOfSingleA = Number.parseInt(configurationElements[0], 10); // Cost of one A-type pizza
    const priceOfSingleB = Number.parseInt(configurationElements[1], 10); // Cost of one B-type pizza
    const priceOfHalfAndHalf = Number.parseInt(configurationElements[2], 10); // Cost for a 'half' of an A/B combo pizza (implying 2 * this for a full combo)
    const quantityOfA_needed = Number.parseInt(configurationElements[3], 10); // Desired count of A-type pizzas
    const quantityOfB_needed = Number.parseInt(configurationElements[4], 10); // Desired count of B-type pizzas

    // Step 4: Validate the parsed numeric values.
    // Ensure all costs and quantities are non-negative and valid numbers (Type III change).
    if (isNaN(priceOfSingleA) || isNaN(priceOfSingleB) || isNaN(priceOfHalfAndHalf) ||
        isNaN(quantityOfA_needed) || isNaN(quantityOfB_needed) ||
        priceOfSingleA < 0 || priceOfSingleB < 0 || priceOfHalfAndHalf < 0 ||
        quantityOfA_needed < 0 || quantityOfB_needed < 0) {
        console.error("Input data error: All costs and quantities must be non-negative integers.");
        return null;
    }

    // Step 5: Determine the common and peak quantities required.
    // These values are crucial for calculating different purchasing strategies.
    // Original: let min = Math.min(x, y), max = Math.max(x, y);
    const minimumRequiredQuantity = Math.min(quantityOfA_needed, quantityOfB_needed);
    const maximumRequiredQuantity = Math.max(quantityOfA_needed, quantityOfB_needed);

    // Introduce a constant for clarity, as `priceOfHalfAndHalf` is multiplied by 2 frequently (Type III change).
    const COMBO_PIZZA_FULL_PRICE_MULTIPLIER = 2;

    // Step 6: Calculate costs for various purchasing strategies.

    // Strategy Option 1: Purchase the minimum common quantity of A and B pizzas individually.
    // Note: The original problem's first option calculates `min * a + min * b`,
    // which is not the total cost for all `x` A and `y` B pizzas bought individually.
    // This calculation represents buying `min(x,y)` of each type separately.
    // Original: let singlePrice = min * a + min * b;
    const costForCommonA_individual = minimumRequiredQuantity * priceOfSingleA;
    const costForCommonB_individual = minimumRequiredQuantity * priceOfSingleB;
    const strategyOneCost = costForCommonA_individual + costForCommonB_individual;

    // Strategy Option 2: Buy combined (half-and-half) pizzas for the common quantity,
    // then purchase any remaining A or B pizzas individually.
    // Original: setPrice1 = min * c * 2 + (x - min) * a + (y - min) * b;
    const costForCombinedCommon = minimumRequiredQuantity * priceOfHalfAndHalf * COMBO_PIZZA_FULL_PRICE_MULTIPLIER;
    const remainingA_toBuy = quantityOfA_needed - minimumRequiredQuantity;
    const remainingB_toBuy = quantityOfB_needed - minimumRequiredQuantity;
    const costForRemainingA_individual = remainingA_toBuy * priceOfSingleA;
    const costForRemainingB_individual = remainingB_toBuy * priceOfSingleB;
    const strategyTwoCost = costForCombinedCommon + costForRemainingA_individual + costForRemainingB_individual;

    // Strategy Option 3: Purchase enough combined (half-and-half) pizzas to satisfy the maximum requirement.
    // This might lead to overbuying of one pizza type.
    // Original: setPrice2 = max * c * 2;
    const strategyThreeCost = maximumRequiredQuantity * priceOfHalfAndHalf * COMBO_PIZZA_FULL_PRICE_MULTIPLIER;

    // Step 7: Determine the absolute minimum cost among all calculated strategies.
    // Instead of pushing to an array and using `apply`, directly use `Math.min` (Type III rewrite).
    const overallMinimumExpense = Math.min(strategyOneCost, strategyTwoCost, strategyThreeCost);

    // Step 8: Output the final result.
    // Original: console.log(bestPrice);
    console.log(overallMinimumExpense);

    // Return the calculated minimum expense (Type III addition for better function utility).
    return overallMinimumExpense;
}

// Example usage demonstrating the function with provided test cases.
// These lines mimic the original invocation pattern.
// Original comment: // Main(require("fs").readFileSync("/dev/stdin", "utf8"));
calculateOptimalPizzaCost("1500 2000 1600 3 2");
calculateOptimalPizzaCost("1500 2000 1900 3 2");
calculateOptimalPizzaCost("1500 2000 500 90000 100000");