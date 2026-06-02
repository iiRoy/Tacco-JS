function countTargetCharacterInPrefix(sourceString, targetChar, prefixLength) {
    let occurrenceCounter = 0;
    // The original code implicitly handles strings shorter than prefixLength
    // by accessing undefined indices, which then do not match the targetChar.
    // We replicate this behavior by iterating up to prefixLength regardless of sourceString's actual length.
    for (let currentPosition = 0; currentPosition < prefixLength; currentPosition++) {
        // Accessing sourceString[currentPosition] for an out-of-bounds index will result in undefined,
        // which will correctly not strictly equal the targetChar.
        if (sourceString[currentPosition] === targetChar) {
            occurrenceCounter++;
        }
    }
    return occurrenceCounter;
}

function calculateTotalCost(rawInputData) {
    const BASE_MENU_PRICE = 700;
    const TOPPING_UNIT_VALUE = 100;
    const DESIRED_TOPPING_IDENTIFIER = 'o';
    const INPUT_SCAN_LIMIT = 3;

    // Determine how many times the desired topping identifier appears in the initial part of the input.
    const toppingOccurrences = countTargetCharacterInPrefix(
        rawInputData,
        DESIRED_TOPPING_IDENTIFIER,
        INPUT_SCAN_LIMIT
    );

    // Calculate the total value contributed by the toppings.
    const totalToppingContribution = toppingOccurrences * TOPPING_UNIT_VALUE;

    // Sum the base price and the topping contribution for the final cost.
    const finalCalculatedPrice = BASE_MENU_PRICE + totalToppingContribution;

    // Output the computed total price.
    console.log(finalCalculatedPrice);
}

calculateTotalCost(require("fs").readFileSync("/dev/stdin", "utf8"));
