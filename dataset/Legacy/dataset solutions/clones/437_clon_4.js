function calculateMinCostIterative(itemData, targetItemName) {
    const finalCosts = new Map();
    const callStack = [];
    const pathSet = new Set();

    const getItemDetails = (name) => {
        const details = itemData[name];
        return details || { price: Infinity, recipe: null };
    };

    callStack.push({
        itemIdentifier: targetItemName,
        processingState: 'evaluate_item',
        componentIndex: 0,
        accumulatedRecipeCost: 0,
        recipePathContainsCycle: false,
        basePurchasePrice: getItemDetails(targetItemName).price
    });

    while (callStack.length > 0) {
        const currentFrame = callStack[callStack.length - 1];

        if (finalCosts.has(currentFrame.itemIdentifier)) {
            callStack.pop();
            if (callStack.length > 0 && callStack[callStack.length - 1].processingState === 'awaiting_component_cost') {
                callStack[callStack.length - 1].componentResult = finalCosts.get(currentFrame.itemIdentifier);
                callStack[callStack.length - 1].processingState = 'evaluate_item';
            }
            continue;
        }

        if (currentFrame.processingState === 'evaluate_item') {
            if (pathSet.has(currentFrame.itemIdentifier)) {
                callStack.pop();
                if (callStack.length > 0 && callStack[callStack.length - 1].processingState === 'awaiting_component_cost') {
                    callStack[callStack.length - 1].componentResult = null;
                    callStack[callStack.length - 1].processingState = 'evaluate_item';
                }
                continue;
            }

            pathSet.add(currentFrame.itemIdentifier);

            const itemInformation = getItemDetails(currentFrame.itemIdentifier);
            if (itemInformation.recipe && itemInformation.recipe.length > 0) {
                currentFrame.processingState = 'process_components';
                currentFrame.componentIndex = 0;
                currentFrame.accumulatedRecipeCost = 0;
                currentFrame.recipePathContainsCycle = false;
            } else {
                pathSet.delete(currentFrame.itemIdentifier);
                finalCosts.set(currentFrame.itemIdentifier, currentFrame.basePurchasePrice);
                callStack.pop();
                if (callStack.length > 0 && callStack[callStack.length - 1].processingState === 'awaiting_component_cost') {
                    callStack[callStack.length - 1].componentResult = currentFrame.basePurchasePrice;
                    callStack[callStack.length - 1].processingState = 'evaluate_item';
                }
            }
        } else if (currentFrame.processingState === 'process_components') {
            const itemInformation = getItemDetails(currentFrame.itemIdentifier);
            const recipeComponents = itemInformation.recipe;

            if (currentFrame.recipePathContainsCycle || currentFrame.componentIndex >= recipeComponents.length) {
                let finalItemValue = currentFrame.basePurchasePrice;
                if (!currentFrame.recipePathContainsCycle) {
                    finalItemValue = Math.min(finalItemValue, currentFrame.accumulatedRecipeCost);
                }

                pathSet.delete(currentFrame.itemIdentifier);
                finalCosts.set(currentFrame.itemIdentifier, finalItemValue);
                callStack.pop();

                if (callStack.length > 0 && callStack[callStack.length - 1].processingState === 'awaiting_component_cost') {
                    callStack[callStack.length - 1].componentResult = finalItemValue;
                    callStack[callStack.length - 1].processingState = 'evaluate_item';
                }
                continue;
            }

            const currentComponent = recipeComponents[currentFrame.componentIndex];

            currentFrame.processingState = 'awaiting_component_cost';
            callStack.push({
                itemIdentifier: currentComponent,
                processingState: 'evaluate_item',
                componentIndex: 0,
                accumulatedRecipeCost: 0,
                recipePathContainsCycle: false,
                basePurchasePrice: getItemDetails(currentComponent).price
            });

        } else if (currentFrame.processingState === 'awaiting_component_cost') {
            const componentValue = currentFrame.componentResult;

            if (componentValue === null) {
                currentFrame.recipePathContainsCycle = true;
            } else {
                currentFrame.accumulatedRecipeCost += componentValue;
            }

            currentFrame.componentIndex++;
            currentFrame.processingState = 'process_components';
        }
    }

    return finalCosts.get(targetItemName);
}

function processInputAndCalculate() {
    const inputLines = input.split('\n');
    let linePointer = 0;

    const retrieveNextLine = () => inputLines[linePointer++];
    const convertToInteger = (str) => parseInt(str, 10);

    while (true) {
        const currentItemRegistry = new Map();

        const itemDefinitionCountString = retrieveNextLine();
        if (!itemDefinitionCountString) break;
        const itemDefinitionCount = convertToInteger(itemDefinitionCountString);
        if (itemDefinitionCount === 0) break;

        for (let k = 0; k < itemDefinitionCount; k++) {
            const itemDescriptionParts = retrieveNextLine().split(' ');
            const itemIdentifier = itemDescriptionParts[0];
            const itemBasePrice = convertToInteger(itemDescriptionParts[1]);
            currentItemRegistry.set(itemIdentifier, { price: itemBasePrice });
        }

        const recipeDefinitionCount = convertToInteger(retrieveNextLine());

        for (let k = 0; k < recipeDefinitionCount; k++) {
            const recipeDescriptionParts = retrieveNextLine().split(' ');
            const itemIdentifier = recipeDescriptionParts[0];
            const componentIdentifiers = recipeDescriptionParts.slice(2);
            currentItemRegistry.get(itemIdentifier).recipe = componentIdentifiers;
        }

        const queryTargetIdentifier = retrieveNextLine();
        
        const itemDataForCalculation = {};
        currentItemRegistry.forEach((value, key) => {
            itemDataForCalculation[key] = value;
        });

        console.log(calculateMinCostIterative(itemDataForCalculation, queryTargetIdentifier));
    }
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  processInputAndCalculate();
});
