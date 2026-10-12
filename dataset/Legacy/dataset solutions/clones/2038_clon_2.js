function ProcessInput(rawData) {
    // Divide the incoming string by spaces to obtain its constituent parts.
    var parts = rawData.split(" ");
    // Convert the initial part into an integer, using base 10 for parsing.
    var firstNum = parseInt(parts[0], 10);
    // Convert the subsequent part into an integer, also using base 10.
    var secondNum = parseInt(parts[1], 10);

    /*
     * This routine computes the total number of pairs that can be formed
     * from two distinct sets of items such that the sum of the chosen pair
     * results in an even value.
     *
     * The fundamental principle relies on the parity of numbers:
     *  - An even number plus another even number yields an even sum.
     *  - An odd number plus an even number yields an odd sum.
     *  - An odd number plus another odd number yields an even sum.
     *
     * We are specifically interested in scenarios where the sum is even.
     * Let 'firstNum' represent the count of items in the first category (e.g., even numbers)
     * and 'secondNum' represent the count of items in the second category (e.g., odd numbers).
     *
     * The number of ways to select two items from the first category is: firstNum * (firstNum - 1).
     * The number of ways to select two items from the second category is: secondNum * (secondNum - 1).
     *
     * The cumulative count of ways to achieve an even sum is the aggregate of these two possibilities.
     */

    if (firstNum >= 2 && secondNum >= 2) {
        // If both groups contain at least two elements, both types of combinations are viable.
        console.log(firstNum * (firstNum - 1) + secondNum * (secondNum - 1));
    } else if (firstNum <= 1) {
        // Should the first group lack sufficient elements, only combinations from the second group are feasible.
        console.log(secondNum * (secondNum - 1));
    } else if (secondNum <= 0) {
        // If the second group contains no elements (or a negative count, which is not practical),
        // the calculation proceeds based on the first group and a modified second group count.
        console.log(firstNum * (secondNum - 1));
    }
}

// The subsequent instruction is dedicated to handling standard input/output operations
// and must remain unaltered to ensure proper program execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
