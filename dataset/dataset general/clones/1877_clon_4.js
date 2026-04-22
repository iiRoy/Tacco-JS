class DataLedger {
    constructor() {
        this.documentCollection = new Map();
        this.projectionCatalog = new Map();
    }

    // Corresponds to db.insert({ index: i }, i.toString());
    storeDocument(payloadContent, uniqueKey) {
        this.documentCollection.set(uniqueKey, JSON.parse(JSON.stringify(payloadContent)));
    }

    // Corresponds to db.views.create('test', mapFunc, reduceFunc, callback, 'description');
    defineProjection(projectionLabel, selectionPredicate, orderingComparator, operationCompletion, descriptorNote) {
        this.projectionCatalog.set(projectionLabel, {
            predicate: selectionPredicate,
            comparator: orderingComparator,
            annotation: descriptorNote
        });

        // Execute immediately to get the initial count, mirroring original behavior
        const initialFiltered = Array.from(this.documentCollection.values()).filter(selectionPredicate);
        const initialSorted = [...initialFiltered].sort(orderingComparator);
        operationCompletion(initialSorted.length);
    }

    // Corresponds to db.views.all('test', callback, filterFunc);
    retrieveProjection(projectionLabel, resultConsumer, postFetchTransformer) {
        const projectionDefinition = this.projectionCatalog.get(projectionLabel);
        if (!projectionDefinition) {
            console.error(`Projection '${projectionLabel}' is undefined.`);
            resultConsumer([], 0);
            return;
        }

        // Apply the projection's base filter and sort
        let initialResults = Array.from(this.documentCollection.values())
            .filter(projectionDefinition.predicate)
            .sort(projectionDefinition.comparator);

        // Apply the post-fetch transformation and filtering
        let finalOutput = [];
        for (const recordItem of initialResults) {
            // Deep copy to ensure modifications are on the returned object, not the stored one
            const mutableRecord = JSON.parse(JSON.stringify(recordItem));
            const transformedItem = postFetchTransformer(mutableRecord);
            if (transformedItem) {
                finalOutput.push(transformedItem);
            }
        }

        resultConsumer(finalOutput, finalOutput.length);
    }
}

// Utility for time-based pauses
const pauseExecution = (durationMilliseconds) => new Promise(resolve => setTimeout(resolve, durationMilliseconds));

// Primary sequence of operations
async function executeWorkflow() {
    // Conceptual path, not directly used in this in-memory simulation
    const dataStorageLocation = '/warehouse/data/records.data';

    // Initialize our in-memory data system, replacing nosql.load()
    const centralDataSystem = new DataLedger();

    // First phase: Define a data projection (after 1 second)
    await pauseExecution(1000);
    const documentSelector = (dataEntry) => dataEntry.positionIdentifier > 10 && dataEntry.positionIdentifier < 1000;
    const documentOrderer = (alphaEntry, betaEntry) => alphaEntry.positionIdentifier > betaEntry.positionIdentifier ? 1 : -1;
    const projectionNotification = (itemQuantity) => {
        console.log(itemQuantity);
    };
    centralDataSystem.defineProjection('primaryDataSet', documentSelector, documentOrderer, projectionNotification, 'initialProjectionSetup');

    // Second phase: Populate the data system (after 2 seconds total)
    await pauseExecution(1000); // 1s after previous step, 2s total
    for (let currentOrdinal = 0; currentOrdinal < 10000; currentOrdinal++) {
        centralDataSystem.storeDocument({ positionIdentifier: currentOrdinal }, currentOrdinal.toString());
    }

    // Third phase: Query the projection with further processing (after 3 seconds total)
    await pauseExecution(1000); // 1s after previous step, 3s total
    const queryPostProcessor = (processingUnit) => {
        if (processingUnit.positionIdentifier > 10 && processingUnit.positionIdentifier < 20) {
            processingUnit.statusIndicator = true;
            return processingUnit;
        }
        return null; // Exclude if conditions not met
    };
    const queryResultConsumer = (selectedItems, totalCount) => {
        console.log(selectedItems, totalCount);
    };
    centralDataSystem.retrieveProjection('primaryDataSet', queryResultConsumer, queryPostProcessor);
}

// Initiate the entire process
executeWorkflow();