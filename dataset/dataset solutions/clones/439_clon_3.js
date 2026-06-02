var CraftingRecipe = (function () {
    function CraftingRecipe(itemName, requiredComponents) {
        this.calculateTotalCost = function () {
            var totalAccumulatedCost = 0;
            var componentsToSum = this.requiredComponents;
            componentsToSum.forEach(function (currentComp) {
                totalAccumulatedCost += currentComp.unitCost;
            });
            return totalAccumulatedCost;
        };
        this.itemName = itemName;
        this.requiredComponents = requiredComponents;
    }
    return CraftingRecipe;
})();
var RawComponent = (function () {
    function RawComponent(itemName, unitCost) {
        this.itemName = itemName;
        this.unitCost = unitCost;
    }
    return RawComponent;
})();
function findEntryByName(collection, targetName) {
    var foundItem = collection.find(function (currentItem) {
        return currentItem.itemName === targetName;
    });
    return foundItem || null;
}
(function (rawDataInput) {
    var standardInputPath = "/dev/stdin";
    var processedInputLines = rawDataInput.replace(/\r/g, '').split("\n");

    function getNextInteger() {
        return parseInt(processedInputLines.shift());
    }

    function getNextLineSplit() {
        return processedInputLines.shift().split(' ');
    }

    function determineMinCost(componentName) {
        var baseComponent = findEntryByName(allComponents, componentName);
        var craftingRecipe = findEntryByName(allRecipes, componentName);
        var computedPrice;

        if (craftingRecipe !== null) {
            craftingRecipe.requiredComponents.map(function (comp) {
                comp.unitCost = determineMinCost(comp.itemName);
                return comp;
            });
            var recipeCalculatedCost = craftingRecipe.calculateTotalCost();
            computedPrice = Math.min(recipeCalculatedCost, baseComponent.unitCost);
        } else {
            computedPrice = baseComponent.unitCost;
        }
        return computedPrice;
    }

    var numEntries, loopCounter, targetItemName, finalPriceList, allComponents, allRecipes;

    while (true) {
        finalPriceList = [];
        allComponents = [];
        allRecipes = [];

        numEntries = getNextInteger();
        if (numEntries === 0) {
            break;
        }

        for (loopCounter = 0; loopCounter < numEntries; loopCounter++) {
            var tempLineParts = getNextLineSplit();
            var newComponent = new RawComponent(tempLineParts[0], parseInt(tempLineParts[1]));
            allComponents.push(newComponent);
        }

        numEntries = getNextInteger();
        for (loopCounter = 0; loopCounter < numEntries; loopCounter++) {
            var tempLineParts = getNextLineSplit();
            var newRecipeInstance;
            var recipeComponentList = tempLineParts.slice(2).map(function (compName) {
                return findEntryByName(allComponents, compName);
            });
            newRecipeInstance = new CraftingRecipe(tempLineParts[0], recipeComponentList);
            allRecipes.push(newRecipeInstance);
        }

        finalPriceList = allComponents.map(function (currentMaterial) {
            var associatedRecipe = findEntryByName(allRecipes, currentMaterial.itemName);
            if (associatedRecipe !== null) {
                return new RawComponent(currentMaterial.itemName, determineMinCost(currentMaterial.itemName));
            } else {
                return currentMaterial;
            }
        });
        
        targetItemName = processedInputLines.shift();
        var finalPurposeItem = findEntryByName(finalPriceList, targetItemName);
        console.log(finalPurposeItem.unitCost);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
