((globalScope) => {
    const assertEquality = (actualValue) => ({
        exists: () => {
            if (typeof actualValue === 'undefined' || actualValue === null) {
                throw new Error(`Verification Failed: Value expected to exist, but was "${actualValue}".`);
            }
        },
        isEquivalentTo: (expectedValue) => {
            if (actualValue !== expectedValue) {
                throw new Error(`Verification Failed: Expected "${actualValue}" to be equivalent to "${expectedValue}", but it was not.`);
            }
        }
    });

    class SimulatedUtility {
        constructor(domReference, configurationObject) {
            this.internalDomReference = domReference;
            this.initialProperties = {
                detail: 'Default text'
            };
            this.activeProperties = { ...this.initialProperties, ...(configurationObject || {}) };
            this.currentLifecyclePhase = 'ready';
        }

        getInitialProperties() {
            return this.initialProperties;
        }

        getEffectiveProperties() {
            return { detail: this.activeProperties.detail };
        }

        getLifecyclePhase() {
            return this.currentLifecyclePhase;
        }

        setLifecyclePhase(newPhase) {
            this.currentLifecyclePhase = newPhase;
        }
    }

    const mockApplicationFramework = (cssSelector) => {
        if (cssSelector === '#targetElement') {
            return {
                // Mimics a jQuery object
                helperMethod: function(...args) {
                    return this; // For method chaining
                },
                // Marker to distinguish from constructor calls
                frameworkInstance: true
            };
        }
        return {};
    };
    mockApplicationFramework.interfacePoint = {}; // Mimics $.fn
    mockApplicationFramework.interfacePoint.helperMethod = function(...args) {
        if (this && this.frameworkInstance) { // If called as a method on a mock framework object
            return this; // Chainable
        }
        // Assume it's a constructor call
        return new SimulatedUtility(args[0], args[1]);
    };

    globalScope.appIntegration = mockApplicationFramework;

    const orchestrateTestCollections = (collectionLabel, collectionStructure) => {
        console.log(`\nLaunching Test Collection: ${collectionLabel}`);
        let executionContext = {};

        if (collectionStructure.globalSetupRoutine) {
            collectionStructure.globalSetupRoutine(executionContext);
        }

        for (const keyName in collectionStructure) {
            if (keyName === 'globalSetupRoutine') continue;

            if (typeof collectionStructure[keyName] === 'function') {
                try {
                    collectionStructure[keyName](executionContext);
                    console.log(`  ✓ Scenario: ${keyName}`);
                } catch (error) {
                    console.error(`  ✗ Scenario: ${keyName}\n    ${error.message}`);
                }
            } else if (typeof collectionStructure[keyName] === 'object' && collectionStructure[keyName] !== null) {
                console.log(`  Entering Sub-Collection: ${keyName}`);
                let subContext = { ...executionContext };
                if (collectionStructure[keyName].subCollectionSetupRoutine) {
                    collectionStructure[keyName].subCollectionSetupRoutine(subContext);
                }
                for (const subKeyName in collectionStructure[keyName]) {
                    if (subKeyName === 'subCollectionSetupRoutine') continue;
                    if (typeof collectionStructure[keyName][subKeyName] === 'function') {
                        try {
                            collectionStructure[keyName][subKeyName](subContext);
                            console.log(`    ✓ Sub-Scenario: ${subKeyName}`);
                        } catch (error) {
                            console.error(`    ✗ Sub-Scenario: ${subKeyName}\n      ${error.message}`);
                        }
                    }
                }
                console.log(`  Exiting Sub-Collection: ${keyName}`);
            }
        }
        console.log(`Finished Test Collection: ${collectionLabel}`);
    };

    orchestrateTestCollections('Core Application Utility Verification', {
        globalSetupRoutine: (ctx) => {
            ctx.configuredData = {
                detail: 'Hello World'
            };
            ctx.targetDomHandle = globalScope.appIntegration('#targetElement');
        },

        'utility_operational_tests': {
            'helper_method_accessibility': (ctx) => {
                assertEquality(globalScope.appIntegration.interfacePoint.helperMethod).exists();
            },
            'method_chainability_confirmation': (ctx) => {
                assertEquality(ctx.targetDomHandle.helperMethod()).isEquivalentTo(ctx.targetDomHandle);
            },
            'initial_property_availability': (ctx) => {
                const utilityComponent = new globalScope.appIntegration.interfacePoint.helperMethod(ctx.targetDomHandle);
                assertEquality(utilityComponent.getInitialProperties()).exists();
            },
            'configuration_overload_validation': (ctx) => {
                const utilityComponent = new globalScope.appIntegration.interfacePoint.helperMethod(ctx.targetDomHandle, ctx.configuredData);
                assertEquality(utilityComponent.getEffectiveProperties().detail).isEquivalentTo(ctx.configuredData.detail);
            }
        },

        'utility_lifecycle_management': {
            subCollectionSetupRoutine: (ctx) => {
                ctx.utilityInstance = new globalScope.appIntegration.interfacePoint.helperMethod(ctx.targetDomHandle);
            },
            'default_lifecycle_phase_check': (ctx) => {
                assertEquality(ctx.utilityInstance.getLifecyclePhase()).isEquivalentTo('ready');
            },
            'lifecycle_phase_update_capability': (ctx) => {
                ctx.utilityInstance.setLifecyclePhase('new phase');
                assertEquality(ctx.utilityInstance.getLifecyclePhase()).isEquivalentTo('new phase');
            }
        }
    });

})(this);