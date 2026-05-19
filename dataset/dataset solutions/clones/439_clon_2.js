var CookbookEntry = (function () {
    // Defines a constructor for a recipe item.
    function CookbookEntry(label, ingredients) {
        // Method to compute the total cost of all ingredients in the recipe.
        this.calculateCost = function () {
            let totalValue = 0; // Initialize accumulator for ingredient costs.
            this.ingredients.forEach(function (item) {
                totalValue += item.cost; // Add each ingredient's cost.
            });
            return totalValue; // Return the aggregated cost.
        };
        this.label = label; // Assign the recipe's name.
        this.ingredients = ingredients; // Assign the list of ingredients.
    }
    return CookbookEntry; // Return the constructor.
})();

var Component = (function () {
    // Defines a constructor for a material component.
    function Component(label, cost) {
        this.label = label; // Assign the component's name.
        this.cost = cost; // Assign the component's price.
    }
    return Component; // Return the constructor.
})();

/**
 * Searches for an element in an array by its 'label' property.
 * @param {Array} collection - The array to search within.
 * @param {string} label - The label to match.
 * @returns {object|null} The found element or null if not found.
 */
function locateByLabel(collection, label) {
    let foundItem = null; // Initialize result as null.
    collection.forEach(function (element) {
        if (element.label === label) { // Check if the element's label matches.
            foundItem = element; // If matched, store the element.
        }
    });
    return foundItem; // Return the found element or null.
}

// Main execution block, immediately invoked function expression.
(function (rawData) {
    /**
     * Recursively determines the minimum cost for a given item,
     * considering both its direct component cost and its recipe cost.
     * @param {string} itemName - The label of the item to compare.
     * @returns {number} The minimum cost.
     */
    function determineMinimumCost(itemName) {
        let componentEntry = locateByLabel(components, itemName); // Find the component by name.
        let recipeEntry = locateByLabel(cookbooks, itemName); // Find the recipe by name.
        let itemCost; // Variable to hold the determined cost.

        if (recipeEntry !== null) { // If a recipe exists for this item.
            // Update the cost of each ingredient in the recipe using recursive calls.
            recipeEntry.ingredients.map(function (ingr) {
                ingr.cost = determineMinimumCost(ingr.label); // Recursively get ingredient's min cost.
                return ingr; // Return the updated ingredient.
            });

            // Compare the recipe's total cost with the direct component cost.
            if (recipeEntry.calculateCost() < componentEntry.cost) {
                itemCost = recipeEntry.calculateCost(); // Recipe is cheaper.
            } else {
                itemCost = componentEntry.cost; // Component is cheaper or equal.
            }
        } else {
            itemCost = componentEntry.cost; // No recipe, so direct component cost is the only option.
        }
        return itemCost; // Return the calculated minimum cost.
    }

    // Process raw input data.
    let inputLines = rawData.replace(/\r/g, '').split("\n"); // Normalize newlines and split into lines.
    let linePointer = 0; // Pointer for current line in inputLines (not used, shift() is used).
    let count; // Variable for number of items.
    let idx; // Loop counter.
    let targetItem; // The final item whose cost needs to be found.
    let lowestCosts; // Array to store materials with their minimum determined costs.
    let components; // Array to store all material components.
    let cookbooks; // Array to store all recipes.

    // Main loop to process multiple test cases.
    while (true) {
        lowestCosts = []; // Reset for each test case.
        components = []; // Reset for each test case.
        cookbooks = []; // Reset for each test case.

        count = parseInt(inputLines.shift()); // Read the number of components.
        if (count === 0) {
            break; // Exit loop if count is 0 (end of input).
        }

        // Read and parse component definitions.
        for (idx = 0; idx < count; idx++) {
            let tempParts = inputLines.shift().split(' '); // Split line into name and price.
            let newComponent = new Component(tempParts[0], parseInt(tempParts[1])); // Create new Component object.
            components.push(newComponent); // Add to components list.
        }

        count = parseInt(inputLines.shift()); // Read the number of recipes.
        // Read and parse recipe definitions.
        for (idx = 0; idx < count; idx++) {
            let tempParts = inputLines.shift().split(' '); // Split line into recipe name and ingredients.
            let newRecipe; // Variable for the new recipe.
            let componentList = []; // List to hold ingredient Component objects.

            // Iterate over ingredient names (starting from the third part of the line).
            tempParts.slice(2).forEach(function (componentName, i) {
                let comp = locateByLabel(components, componentName); // Find the actual Component object.
                componentList.push(comp); // Add to the ingredient list.
            });
            newRecipe = new CookbookEntry(tempParts[0], componentList); // Create new Recipe object.
            cookbooks.push(newRecipe); // Add to recipes list.
        }

        // Determine minimum costs for all components that might be part of a recipe.
        components.forEach(function (comp) {
            let recipeForComp = locateByLabel(cookbooks, comp.label); // Check if there's a recipe for this component.
            if (recipeForComp !== null) {
                // If a recipe exists, calculate its minimum cost.
                lowestCosts.push(new Component(comp.label, determineMinimumCost(comp.label)));
            } else {
                // If no recipe, its direct cost is the minimum.
                lowestCosts.push(comp);
            }
        });

        // Find the target item's minimum cost.
        targetItem = locateByLabel(lowestCosts, inputLines.shift());
        console.log(targetItem.cost); // Output the final minimum cost.
    }
})(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from stdin.
