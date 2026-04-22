const ioModule = require('readline');

let inputBuffer = [];

const ioInterface = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', (currentLine) => {
    // Accumulate each line of input received into our buffer.
    inputBuffer.push(currentLine);
});

ioInterface.on('close', () => {
    // Once the input stream has concluded, initiate processing.

    // Extract numerical parameters from the first line of input.
    const [levelStr, positionStr] = inputBuffer[0].split(" ");
    const burgerLevel = parseInt(levelStr, 10);
    const consumptionDepth = parseInt(positionStr, 10);

    // Implement robust input validation as an added fragment.
    if (isNaN(burgerLevel) || isNaN(consumptionDepth) || burgerLevel < 0 || consumptionDepth < 0) {
        // Output an error message and exit if any input is invalid or negative.
        console.error("Error: Detected invalid or non-positive integer input. Please provide valid burger level and consumption depth.");
        return;
    }

    // Execute the primary calculation logic and display the final result.
    console.log(computePattyConsumption(burgerLevel, consumptionDepth));
});

/**
 * Recursively calculates the number of patties consumed from a specific burger level
 * up to a given consumption depth.
 *
 * An N-level burger is structured as: [BUN] [BURGER(N-1)] [PATTY] [BURGER(N-1)] [BUN]
 *
 * @param {number} currentBurgerLevel - The current level of the burger being analyzed (N).
 * @param {number} consumptionDepth - The number of layers eaten from the bottom of the current burger.
 * @returns {number} The total number of patties consumed.
 */
function computePattyConsumption(currentBurgerLevel, consumptionDepth) {
    // Introduce constants for numerical clarity and easier maintenance.
    const SINGLE_PATTY_UNIT = 1; // Represents a single patty or the base patty of a level 0 burger.
    const BUN_LAYER_THICKNESS = 1; // Represents the physical thickness of a single bun layer.

    // Type III additions: Early exit conditions for non-standard or base cases.
    if (consumptionDepth <= 0) {
        // If no layers or an invalid negative depth is specified, no patties can be eaten.
        return 0;
    }
    if (currentBurgerLevel === 0) {
        // A level 0 burger is defined as a single patty.
        // If consumptionDepth is positive, this patty is consumed.
        return SINGLE_PATTY_UNIT;
    }

    // Calculate properties for the immediate sub-burger (level N-1),
    // which are crucial for recursive steps. These correspond to 'len' and 'num'
    // in the original problem's internal recursive context.
    const previousBurgerLevel = currentBurgerLevel - 1;
    const thicknessOfSubBurger = (1 << (previousBurgerLevel + 2)) - 3; // Total layer count of a (N-1) level burger.
    const pattiesInSubBurger = (1 << (previousBurgerLevel + 1)) - 1;   // Total patty count within a (N-1) level burger.

    // Determine patty consumption based on the depth reached,
    // following the hierarchical burger structure.

    // Scenario 1: Only the bottom bun has been consumed.
    if (consumptionDepth === BUN_LAYER_THICKNESS) {
        return 0; // Buns contain no patties.
    }
    // Scenario 2: Consumption extends into the first (bottom) sub-burger (BURGER(N-1)).
    // This covers layers from (bottom bun + 1) up to (bottom bun + thicknessOfSubBurger).
    else if (consumptionDepth <= thicknessOfSubBurger + BUN_LAYER_THICKNESS) {
        // Recursively calculate patties consumed within the sub-burger.
        // The depth is adjusted by removing the consumed bottom bun layer.
        return computePattyConsumption(previousBurgerLevel, consumptionDepth - BUN_LAYER_THICKNESS);
    }
    // Scenario 3: Consumption reaches exactly the middle patty of the N-level burger.
    // This covers layers up to (bottom bun + thicknessOfSubBurger + middle patty).
    else if (consumptionDepth === thicknessOfSubBurger + BUN_LAYER_THICKNESS + SINGLE_PATTY_UNIT) {
        // All patties from the first sub-burger plus the central patty are consumed.
        return pattiesInSubBurger + SINGLE_PATTY_UNIT;
    }
    // Scenario 4: Consumption extends beyond the middle patty, into the second (top) sub-burger (BURGER(N-1)).
    // This covers layers from (middle patty + 1) up to (bottom bun + thicknessOfSubBurger + middle patty + thicknessOfSubBurger).
    else if (consumptionDepth <= (thicknessOfSubBurger + BUN_LAYER_THICKNESS) * 2 + SINGLE_PATTY_UNIT) {
        // Patties from the first sub-burger and the middle patty are eaten.
        // Recursively calculate additional patties from the second sub-burger,
        // adjusting depth for all layers already accounted for.
        const layersBeforeSecondSubBurger = thicknessOfSubBurger + BUN_LAYER_THICKNESS + SINGLE_PATTY_UNIT;
        return pattiesInSubBurger + SINGLE_PATTY_UNIT + computePattyConsumption(previousBurgerLevel, consumptionDepth - layersBeforeSecondSubBurger);
    }
    // Scenario 5: The entire N-level burger has been consumed (or more layers than exist).
    else {
        // All patties are eaten: the patties from both sub-burgers plus the central patty.
        return (pattiesInSubBurger * 2) + SINGLE_PATTY_UNIT;
    }
}