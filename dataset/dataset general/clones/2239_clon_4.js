const globalNoticeRegistry = new Map();

class Notice {
    constructor(msg) {
        this.identifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.description = msg;
    }
}

const NotificationManager = {
    _primaryCompartment: 'main',

    compartmentInterface(compartmentName) {
        return {
            _compartmentId: compartmentName,

            issueSignal(message) {
                if (!globalNoticeRegistry.has(this._compartmentId)) {
                    globalNoticeRegistry.set(this._compartmentId, new Set());
                }
                const newSignal = new Notice(message);
                globalNoticeRegistry.get(this._compartmentId).add(newSignal);
                return newSignal;
            },

            withdrawSignal(signalObject) {
                if (globalNoticeRegistry.has(this._compartmentId)) {
                    return globalNoticeRegistry.get(this._compartmentId).delete(signalObject);
                }
                return false;
            },

            retrieveSignals() {
                return globalNoticeRegistry.get(this._compartmentId) || new Set();
            }
        };
    },

    issueGeneralSignal(message) {
        return this.compartmentInterface(this._primaryCompartment).issueSignal(message);
    },

    withdrawGeneralSignal(signalObject) {
        return this.compartmentInterface(this._primaryCompartment).withdrawSignal(signalObject);
    },

    getOverallRegistry() {
        return globalNoticeRegistry;
    }
};

function executeVerificationSet(setName, scenarios) {
    console.log(`\n--- ${setName} ---`);
    let successfulChecks = 0;
    let totalChecks = 0;

    for (const scenarioKey in scenarios) {
        totalChecks++;
        try {
            globalNoticeRegistry.clear();
            scenarios[scenarioKey]();
            console.log(`  ✓ ${scenarioKey}`);
            successfulChecks++;
        } catch (error) {
            console.error(`  ✗ ${scenarioKey}`);
            console.error(`    Issue: ${error.message}`);
        }
    }
    console.log(`\n${successfulChecks}/${totalChecks} verifications completed in ${setName}`);
}

function verifyCondition(condition, message) {
    if (!condition) {
        throw new Error(message || "Condition failed");
    }
}

function verifyCollectionSize(collection, expectedSize, message) {
    verifyCondition(collection.size === expectedSize, message || `Expected size ${expectedSize}, received ${collection.size}`);
}

function verifyBooleanResult(actual, expected, message) {
    verifyCondition(actual === expected, message || `Expected boolean ${expected}, received ${actual}`);
}

executeVerificationSet('Notification System Operations', {
    'Should remove a signal from the primary compartment': function() {
        const initialSignal = NotificationManager.issueGeneralSignal('Initial issue');
        
        verifyCollectionSize(NotificationManager.compartmentInterface('main').retrieveSignals(), 1, "Initial primary compartment signal count should be 1");
        NotificationManager.withdrawGeneralSignal(initialSignal);
        verifyCollectionSize(NotificationManager.compartmentInterface('main').retrieveSignals(), 0, "Primary compartment signal count after withdrawal should be 0");
    },

    'Should remove a signal from a designated compartment': function() {
        const designatedCompartment = NotificationManager.compartmentInterface('sectorA');
        const compartmentSignal = designatedCompartment.issueSignal('Sector A problem');

        verifyCollectionSize(designatedCompartment.retrieveSignals(), 1, "Initial 'sectorA' signal count should be 1");
        designatedCompartment.withdrawSignal(compartmentSignal);
        verifyCollectionSize(designatedCompartment.retrieveSignals(), 0, "'sectorA' signal count after withdrawal should be 0");
    },

    'Should return false if withdrawal from an unrelated compartment is attempted': function() {
        const sourceCompartment = NotificationManager.compartmentInterface('sectorB');
        const targetCompartment = NotificationManager.compartmentInterface('sectorC');
        const sourceSignal = sourceCompartment.issueSignal('Sector B issue');

        verifyCollectionSize(sourceCompartment.retrieveSignals(), 1, "Initial 'sectorB' signal count should be 1");
        verifyCollectionSize(targetCompartment.retrieveSignals(), 0, "Initial 'sectorC' signal count should be 0");

        const withdrawalAttempt = targetCompartment.withdrawSignal(sourceSignal);
        verifyBooleanResult(withdrawalAttempt, false, "Withdrawal from unrelated compartment should yield false");

        verifyCollectionSize(sourceCompartment.retrieveSignals(), 1, "'sectorB' signal count must remain 1 after failed withdrawal");
    }
});