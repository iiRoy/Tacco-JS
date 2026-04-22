let collectionForProcessing;
let passCount = 0;
let failCount = 0;

const processCollection = {
    obtainHighest: (items, selector, startingPoint = -Infinity) => {
        if (!Array.isArray(items) || items.length === 0) {
            return startingPoint === -Infinity ? undefined : startingPoint;
        }
        return items.reduce((currentHigh, currentItem) => {
            const itemAttribute = currentItem[selector];
            return Math.max(currentHigh, itemAttribute);
        }, startingPoint === -Infinity ? items[0][selector] : startingPoint);
    },

    obtainLowest: (items, selector, startingPoint = Infinity) => {
        if (!Array.isArray(items) || items.length === 0) {
            return startingPoint === Infinity ? undefined : startingPoint;
        }
        return items.reduce((currentLow, currentItem) => {
            const itemAttribute = currentItem[selector];
            return Math.min(currentLow, itemAttribute);
        }, startingPoint === Infinity ? items[0][selector] : startingPoint);
    },

    computeTotal: (items, selector) => {
        if (!Array.isArray(items) || items.length === 0) {
            return 0;
        }
        return items.reduce((aggregateSum, currentItem) => {
            const itemAttribute = currentItem[selector];
            return aggregateSum + (typeof itemAttribute === 'number' ? itemAttribute : 0);
        }, 0);
    }
};

const configureTestBatch = (label, batchOperations) => {
    // console.log(`\nBatch: ${label}`);
    batchOperations();
};

const prepareDataset = () => {
    collectionForProcessing = [{attribute: 7}, {attribute: 17}, {attribute: 77}];
};

const runEvaluation = (description, evaluationFunction) => {
    // console.log(`  Evaluation: ${description}`);
    evaluationFunction();
};

const assertEquality = (actualResult, expectedResult, message) => {
    if (actualResult === expectedResult) {
        passCount++;
        // console.log(`    PASS: ${message}`);
    } else {
        failCount++;
        // console.error(`    FAIL: ${message} (Actual: ${actualResult}, Expected: ${expectedResult})`);
    }
};

configureTestBatch("AttributeCalculationGroup", () => {
    prepareDataset();

    runEvaluation("highest attribute value should be retrieved from the collection", () => {
        const topValue = processCollection.obtainHighest(collectionForProcessing, 'attribute');
        assertEquality(topValue, 77, "Highest value of 'attribute' should be 77");
    });

    runEvaluation("specified starting point should be returned if no higher attribute value exists", () => {
        const topValue = processCollection.obtainHighest(collectionForProcessing, 'attribute', 100);
        assertEquality(topValue, 100, "Starting point 100 should be returned as it's higher");
    });

    runEvaluation("lowest attribute value should be retrieved from the collection", () => {
        const bottomValue = processCollection.obtainLowest(collectionForProcessing, 'attribute');
        assertEquality(bottomValue, 7, "Lowest value of 'attribute' should be 7");
    });

    runEvaluation("specified starting point should be returned if no lower attribute value exists", () => {
        const bottomValue = processCollection.obtainLowest(collectionForProcessing, 'attribute', 1);
        assertEquality(bottomValue, 1, "Starting point 1 should be returned as it's lower");
    });

    runEvaluation("sum of all attribute values in the collection should be calculated", () => {
        const totalSum = processCollection.computeTotal(collectionForProcessing, 'attribute');
        assertEquality(totalSum, 101, "Sum of 'attribute' values should be 101");
    });
});

// console.log(`\n--- Summary ---`);
// console.log(`Total assertions passed: ${passCount}`);
// console.log(`Total assertions failed: ${failCount}`);
// if (failCount === 0) {
//     console.log("All evaluations completed successfully.");
// } else {
//     console.error("Some evaluations did not pass.");
// }