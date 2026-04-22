class CulinaryItem {
    // A constructor to initialize a new composite item.
    constructor(identifier, constituentParts) {
        // Validate input for robustness, a Type III addition.
        if (!identifier || typeof identifier !== 'string') {
            throw new Error("CulinaryItem requires a valid string identifier.");
        }
        if (!Array.isArray(constituentParts)) {
            // Ensure constituentParts is an array, provide default if not.
            console.warn(`Warning: constituentParts for ${identifier} should be an array. Initializing as empty.`);
            this.constituentParts = [];
        } else {
            this.constituentParts = constituentParts;
        }
        this.label = identifier;
    }

    /**
     * Calculates the aggregate cost of all constituent parts.
     * This method assumes the 'unitCost' of each part is already set to its optimal value.
     * @returns {number} The total cost.
     */
    getCalculatedCost() {
        let accumulatedCost = 0; // Renamed variable from 'sum'
        // Using reduce for a more functional approach, a Type III update.
        accumulatedCost = this.constituentParts.reduce((currentTotal, part) => {
            // Add a guard for potentially missing 'unitCost' in a part.
            if (typeof part.unitCost === 'number' && !isNaN(part.unitCost)) {
                return currentTotal + part.unitCost;
            } else {
                console.error(`Error: Part '${part.label}' has an invalid unitCost: ${part.unitCost}. Assuming 0.`);
                return currentTotal; // Treat invalid cost as 0
            }
        }, 0);
        return accumulatedCost;
    }
}

class Ingredient {
    // Constructor for a basic ingredient entity.
    constructor(identifier, costValue) {
        // Basic validation for cost, a Type III addition.
        if (typeof costValue !== 'number' || isNaN(costValue) || costValue < 0) {
            console.error(`Invalid cost value provided for ingredient '${identifier}': ${costValue}. Setting to 0.`);
            this.unitCost = 0;
        } else {
            this.unitCost = costValue; // Renamed 'price' to 'unitCost'
        }
        this.label = identifier; // Renamed 'name' to 'label'
    }

    // A simple helper method, a Type III addition.
    displayInfo() {
        return `Ingredient: ${this.label}, Cost: ${this.unitCost}`;
    }
}

/**
 * Searches for an entry by its label in a given collection.
 * @param {Array<Object>} itemCollection The array of items to search through.
 * @param {string} targetLabel The label to match.
 * @returns {Object|null} The found item or null if not found.
 */
function findEntryByLabel(itemCollection, targetLabel) { // Renamed function and parameters.
    // Guard clause for empty collection, a Type III addition.
    if (!Array.isArray(itemCollection) || itemCollection.length === 0) {
        // console.warn("Attempted to search an empty or invalid collection."); // Optional logging
        return null;
    }
    // Using `find` for conciseness, a Type II/III update.
    const matchingEntry = itemCollection.find(element => element.label === targetLabel);
    return matchingEntry || null; // Ensure explicit null return.
}

// Main processing logic encapsulated in a named function for better structure.
function processCulinaryData(rawInputData) { // Renamed parameter.
    // Normalize line endings and split into an array of strings.
    const dataRows = rawInputData.replace(/\r/g, '').split('\n'); // Renamed variable.
    let lineCursor = 0; // Renamed 'index' to 'lineCursor' for clarity.

    // Helper to safely get the next line from input.
    const getNextLine = () => {
        if (lineCursor >= dataRows.length) {
            // A Type III addition: more robust input handling.
            console.error("Attempted to read past end of input data.");
            return null;
        }
        return dataRows[lineCursor++];
    };

    // Cache for memoization in optimal price calculation, a key Type III addition.
    const optimalPriceCache = new Map();

    /**
     * Recursively determines the minimum possible cost for a given item.
     * This function now takes all necessary data and a cache, making it more pure.
     * @param {string} itemName The label of the item to evaluate.
     * @param {Array<Ingredient>} allIngredients All known base ingredients.
     * @param {Array<CulinaryItem>} allDishes All known recipes/dishes.
     * @returns {number} The minimum cost.
     */
    const resolveOptimalPrice = (itemName, allIngredients, allDishes) => { // Renamed function.
        // Check cache first (memoization).
        if (optimalPriceCache.has(itemName)) {
            return optimalPriceCache.get(itemName);
        }

        const baseComponent = findEntryByLabel(allIngredients, itemName); // Renamed variable.
        const compositeItem = findEntryByLabel(allDishes, itemName); // Renamed variable.

        if (!baseComponent) {
            // This is an error condition not explicitly handled in original, a Type III addition.
            console.error(`Critical Error: Base ingredient '${itemName}' not found.`);
            optimalPriceCache.set(itemName, Infinity); // Cache error to prevent re-computation.
            return Infinity; // Indicate an unresolvable item.
        }

        let currentOptimalValue = baseComponent.unitCost; // Renamed variable.

        // If an alternative recipe (composite item) exists for this item name.
        if (compositeItem) {
            let dishCalculatedCost = 0;
            // Calculate the cost of the composite item by summing optimal costs of its parts.
            // This replaces the side-effect modification of m.price in the original.
            for (const part of compositeItem.constituentParts) { // Using for...of, a Type II/III change.
                dishCalculatedCost += resolveOptimalPrice(part.label, allIngredients, allDishes);
            }
            // Compare the base ingredient's cost with the composite item's calculated cost.
            currentOptimalValue = Math.min(currentOptimalValue, dishCalculatedCost);
        }

        // Store the result in cache before returning.
        optimalPriceCache.set(itemName, currentOptimalValue);
        return currentOptimalValue;
    };

    while (true) {
        optimalPriceCache.clear(); // Clear cache for each test case, a Type III addition.
        const optimizedCosts = []; // Renamed from minPrices.
        const allIngredients = []; // Renamed from materials.
        const allDishes = []; // Renamed from recipes.

        const numIngredientsStr = getNextLine();
        if (numIngredientsStr === null) break; // Handle unexpected end of input.
        let numItems = parseInt(numIngredientsStr); // Renamed 'n' to 'numItems'.

        if (isNaN(numItems) || numItems < 0) {
            console.error(`Invalid number of ingredients: ${numIngredientsStr}. Skipping this block.`);
            // Skip lines for this invalid block to prevent further parsing errors.
            // This is a Type III robust error handling.
            for(let i = 0; i < Math.abs(numItems); i++) getNextLine(); // Try to consume expected lines if numItems is negative
            let nextN = parseInt(getNextLine()); // Try to get next numItems for dishes
            for(let i = 0; i < Math.abs(nextN); i++) getNextLine(); // Consume dish lines
            getNextLine(); // Consume target line
            continue; // Move to next test case.
        }

        if (numItems === 0) {
            // This is the termination condition for the loop.
            break;
        }

        // Processing base ingredients.
        for (let loopIter = 0; loopIter < numItems; loopIter++) { // Renamed 'i' to 'loopIter'.
            const lineParts = getNextLine().split(' '); // Renamed 'tmp' to 'lineParts'.
            if (lineParts.length < 2) {
                console.error(`Skipping malformed ingredient line: '${lineParts.join(' ')}'`);
                continue; // Type III error handling.
            }
            const createdComponent = new Ingredient(lineParts[0], parseInt(lineParts[1])); // Renamed 'm'.
            allIngredients.push(createdComponent);
        }

        const numDishesStr = getNextLine();
        if (numDishesStr === null) break;
        numItems = parseInt(numDishesStr);

        if (isNaN(numItems) || numItems < 0) {
            console.error(`Invalid number of dishes: ${numDishesStr}. Skipping this block.`);
            for(let i = 0; i < Math.abs(numItems); i++) getNextLine(); // Consume dish lines
            getNextLine(); // Consume target line
            continue;
        }

        // Processing composite items (recipes).
        for (let loopIter = 0; loopIter < numItems; loopIter++) {
            const lineParts = getNextLine().split(' ');
            if (lineParts.length < 2) {
                console.error(`Skipping malformed dish line: '${lineParts.join(' ')}'`);
                continue;
            }
            // Parse number of ingredients for the dish, a Type III addition for clarity.
            const numDishIngredients = parseInt(lineParts[1]);
            const partCollection = []; // Renamed 'materialList'.

            // Validate and collect ingredients for the dish.
            for(let k = 0; k < numDishIngredients; k++) { // Explicit loop based on count.
                const ingredientLabel = lineParts[2 + k]; // Accessing directly by index.
                if (!ingredientLabel) {
                    console.error(`Missing ingredient label for dish '${lineParts[0]}' at index ${k}.`);
                    continue;
                }
                const foundIngredient = findEntryByLabel(allIngredients, ingredientLabel);
                if (foundIngredient) {
                    partCollection.push(foundIngredient);
                } else {
                    // Type III: Add a placeholder or warning for unknown ingredients.
                    console.warn(`Ingredient '${ingredientLabel}' for dish '${lineParts[0]}' not found in base ingredients.`);
                    // Optionally push a dummy ingredient or skip. Skipping for now.
                }
            }

            const assembledItem = new CulinaryItem(lineParts[0], partCollection); // Renamed 'r'.
            allDishes.push(assembledItem);
        }

        // Calculate and store optimal prices for all base ingredients.
        // Using map for transformation, a Type II/III update.
        for (const baseItem of allIngredients) {
            const optimalValue = resolveOptimalPrice(baseItem.label, allIngredients, allDishes);
            // Create a new Ingredient object to store the optimal value, avoiding modification of original.
            optimizedCosts.push(new Ingredient(baseItem.label, optimalValue));
        }

        // Determine the final query item.
        const finalQueryLabel = getNextLine(); // Renamed 'purpose'.
        if (!finalQueryLabel) {
            console.error("Missing target item for price calculation. Skipping.");
            continue;
        }
        const targetItem = findEntryByLabel(optimizedCosts, finalQueryLabel); // Renamed variable.

        if (targetItem) {
            console.log(targetItem.unitCost); // Renamed 'price' to 'unitCost'.
        } else {
            // Type III: Handle case where target item is not found.
            console.error(`Error: Target item '${finalQueryLabel}' not found in optimized costs.`);
            console.log("0"); // Output 0 or a specific error code.
        }
    }
}

// Execute the main processing function with input from stdin.
processCulinaryData(require("fs").readFileSync("/dev/stdin", "utf8"));