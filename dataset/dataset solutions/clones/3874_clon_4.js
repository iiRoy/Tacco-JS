const customApplicationLoader = (() => {

    const applicationRegistry = {};

    const ioHandler = (() => {
        let accumulatedInput = '';

        const retrieveAllInput = () => {
            return new Promise((completionCallback, errorCallback) => {
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', (chunk) => {
                    accumulatedInput += chunk;
                });
                process.stdin.on('end', () => {
                    completionCallback(accumulatedInput);
                });
                process.stdin.on('error', (err) => {
                    errorCallback(err);
                });
            });
        };

        const outputContent = (dataToWrite) => {
            return new Promise((completionCallback, errorCallback) => {
                process.stdout.write(dataToWrite, 'utf8', (err) => {
                    if (err) errorCallback(err);
                    else completionCallback();
                });
            });
        };

        return { retrieveAllInput, outputContent };
    })();

    const extractConfiguration = (headline) => {
        const components = headline.trim().split(/\s+/).filter(Boolean);
        if (components.length !== 2) {
            return { outcome: null, problem: 'Incorrect format for initial configuration.' };
        }
        const numericValueA = parseInt(components[0], 10);
        const numericValueB = parseInt(components[1], 10);
        if (isNaN(numericValueA) || isNaN(numericValueB)) {
            return { outcome: null, problem: 'Configuration values must be integers.' };
        }
        return { outcome: { quantity: numericValueA, capacity: numericValueB }, problem: null };
    };

    const extractCostsPerItem = (costLines) => {
        const itemPricing = [];
        for (const lineEntry of costLines) {
            const trimmedLine = lineEntry.trim();
            if (trimmedLine === '') continue;

            const costValue = parseInt(trimmedLine, 10);
            if (isNaN(costValue)) {
                return { outcome: null, problem: `Invalid cost detected: ${trimmedLine}` };
            }
            itemPricing.push(costValue);
        }
        return { outcome: itemPricing, problem: null };
    };

    const computeOptimalItemCount = (rawDataSource) => {
        const allLines = rawDataSource.trim().split('\n').filter(Boolean);

        if (allLines.length === 0) {
            return { outcome: null, problem: 'No input provided for processing.' };
        }

        const configResult = extractConfiguration(allLines[0]);
        if (configResult.problem) {
            return configResult;
        }
        const { quantity: initialItems, capacity: availableResource } = configResult.outcome;

        const remainingInputLines = allLines.slice(1);
        const costsResult = extractCostsPerItem(remainingInputLines);
        if (costsResult.problem) {
            return costsResult;
        }
        const itemPrices = costsResult.outcome;

        if (itemPrices.length !== initialItems) {
            return { outcome: null, problem: `Expected ${initialItems} item prices, received ${itemPrices.length}.` };
        }

        let totalResourceSpent = 0;
        let lowestIndividualCost = Number.MAX_SAFE_INTEGER;

        for (let idx = 0; idx < itemPrices.length; idx++) {
            const currentItemPrice = itemPrices[idx];
            totalResourceSpent += currentItemPrice;
            if (currentItemPrice < lowestIndividualCost) {
                lowestIndividualCost = currentItemPrice;
            }
        }

        const resourceLeftover = availableResource - totalResourceSpent;
        let supplementaryItems = 0;

        if (resourceLeftover > 0 && lowestIndividualCost > 0) {
            supplementaryItems = Math.floor(resourceLeftover / lowestIndividualCost);
        }

        const finalTotalItems = initialItems + supplementaryItems;

        return { outcome: finalTotalItems.toString() + '\n', problem: null };
    };

    applicationRegistry.launchMainProcess = async () => {
        try {
            const receivedText = await ioHandler.retrieveAllInput();
            const processResult = computeOptimalItemCount(receivedText);

            if (processResult.problem) {
                console.error('Critical Application Error:', processResult.problem);
                process.exit(1);
            }

            await ioHandler.outputContent(processResult.outcome);
        } catch (runtimeError) {
            console.error('Unhandled Runtime Exception:', runtimeError.message);
            process.exit(1);
        }
    };

    return applicationRegistry;

})();

customApplicationLoader.launchMainProcess();