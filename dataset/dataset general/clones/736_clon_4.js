function generateAccessor(initialDatum) {
    let currentDatum = initialDatum;
    const datumAccessor = function(newDatum) {
        if (arguments.length > 0) {
            currentDatum = newDatum;
        }
        return currentDatum;
    };
    return datumAccessor;
}

function processObjectForManagement(sourceObject) {
    const managedObject = {};
    if (sourceObject && Array.isArray(sourceObject.listComponent)) {
        managedObject.listComponent = [];
        managedObject.listComponent.insertElement = function(itemPayload, bypassWrapping = false) {
            if (bypassWrapping) {
                this.push(itemPayload);
            } else {
                const wrappedPayload = {};
                for (const key in itemPayload) {
                    if (Object.prototype.hasOwnProperty.call(itemPayload, key)) {
                        wrappedPayload[key] = generateAccessor(itemPayload[key]);
                    }
                }
                this.push(wrappedPayload);
            }
        };
        managedObject.listComponent.retrieveElement = function() {
            return this.pop();
        };
    }
    return managedObject;
}

const confirmEquality = (condition, successDescription, failureDescription) => {
    if (condition) {
        console.log(`[OK] ${successDescription}`);
    } else {
        console.error(`[FAIL] ${failureDescription}`);
        throw new Error(failureDescription);
    }
};

let sharedDataStore;

const initializeDataStore = () => {
    sharedDataStore = {
        listComponent: []
    };
};

const clearDataStore = () => {
    sharedDataStore = undefined;
};

const executeScenarioOne = () => {
    let managedRepresentation, acquiredItem;

    initializeDataStore();
    managedRepresentation = processObjectForManagement(sharedDataStore);
    managedRepresentation.listComponent.insertElement({ indicator: true });
    acquiredItem = managedRepresentation.listComponent.retrieveElement();

    confirmEquality(acquiredItem.indicator() === true,
                    "Scenario 1: Wrapped item's property accessed via function is true",
                    "Scenario 1: Wrapped item's property accessed via function is NOT true");
    clearDataStore();
};

const executeScenarioTwo = () => {
    let managedRepresentation, acquiredItem;

    initializeDataStore();
    managedRepresentation = processObjectForManagement(sharedDataStore);
    managedRepresentation.listComponent.insertElement({ indicator: true }, true);
    acquiredItem = managedRepresentation.listComponent.retrieveElement();

    confirmEquality(acquiredItem.indicator === true,
                    "Scenario 2: Unwrapped item's property accessed directly is true",
                    "Scenario 2: Unwrapped item's property accessed directly is NOT true");
    clearDataStore();
};

const runAllOperationChecks = () => {
    try {
        console.log("Starting operation checks...");
        executeScenarioOne();
        executeScenarioTwo();
        console.log("All operation checks completed successfully!");
    } catch (errorDetails) {
        console.error(`Operation checks failed: ${errorDetails.message}`);
    }
};

runAllOperationChecks();